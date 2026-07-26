import { readFileSync } from "node:fs";

import { z } from "zod";

const laneDefinitionSchema = z.object({
  number: z.number().int().positive(),
  path: z.string().min(1),
});

const simulatorSlimmingProfileSchema = z.object({
  exceptCategories: z.array(z.string().min(1)),
  keepServices: z.array(z.string().min(1)).optional(),
});

const laneServiceSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  directory: z.string().min(1),
  runner: z.discriminatedUnion("type", [
    z.object({ type: z.literal("bun-script"), script: z.string().min(1) }),
    z.object({ type: z.literal("npm-script"), script: z.string().min(1) }),
    z.object({ type: z.literal("artisan"), command: z.string().min(1) }),
  ]),
});

const activeProjectSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    remoteUrl: z.string().url(),
    baseBranch: z.string().min(1),
    lanes: z.array(laneDefinitionSchema).min(1),
    environmentVariable: z.string().min(1),
    services: z.array(laneServiceSchema).min(1),
    simulatorSlimming: simulatorSlimmingProfileSchema.optional(),
  })
  .superRefine(({ lanes, services }, context) => {
    if (new Set(lanes.map(({ number }) => number)).size !== lanes.length) {
      context.addIssue({ code: "custom", message: "Lane numbers must be unique" });
    }
    if (new Set(lanes.map(({ path }) => path)).size !== lanes.length) {
      context.addIssue({ code: "custom", message: "Lane paths must be unique" });
    }
    if (new Set(services.map(({ id }) => id)).size !== services.length) {
      context.addIssue({ code: "custom", message: "Lane service ids must be unique" });
    }
  });

const lanesConfigSchema = z.object({
  version: z.literal(3),
  projects: z.array(activeProjectSchema),
});

export interface ActiveProject {
  id: string;
  name: string;
  remoteUrl: string;
  baseBranch: string;
  lanes: LaneDefinition[];
  environmentVariable: string;
  services: LaneServiceDefinition[];
  simulatorSlimming?: SimulatorSlimmingProfile;
}

export interface LaneServiceDefinition {
  id: string;
  name: string;
  directory: string;
  runner:
    | { type: "bun-script"; script: string }
    | { type: "npm-script"; script: string }
    | { type: "artisan"; command: string };
}

export interface SimulatorSlimmingProfile {
  exceptCategories: string[];
  keepServices?: string[];
}

export interface LaneDefinition {
  number: number;
  path: string;
}

export interface LanesConfig {
  version: 3;
  projects: ActiveProject[];
}

export function createLanesConfig(projects: ActiveProject[]): LanesConfig {
  return lanesConfigSchema.parse({ version: 3, projects });
}

export function readLanesConfig(path: string): LanesConfig {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  return lanesConfigSchema.parse(value);
}
