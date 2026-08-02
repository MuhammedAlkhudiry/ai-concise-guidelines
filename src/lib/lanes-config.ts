import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

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

const pullRequestAutomationSchema = z.object({
  model: z.string().min(1),
});

const projectFields = {
  id: z.string().min(1),
  name: z.string().min(1),
  remoteUrl: z.string().url(),
  baseBranch: z.string().min(1),
  lanes: z.array(laneDefinitionSchema),
  environmentVariable: z.string().min(1),
  services: z.array(laneServiceSchema).min(1),
  simulatorSlimming: simulatorSlimmingProfileSchema.optional(),
  pullRequest: pullRequestAutomationSchema.optional(),
};

const legacyProjectSchema = z.object(projectFields).superRefine(validateProject);
const activeProjectSchema = z
  .object({
    ...projectFields,
    lanePathPattern: z.string().includes("{number}"),
  })
  .superRefine(validateProject);

const legacyLanesConfigSchema = z.object({
  version: z.literal(3),
  projects: z.array(legacyProjectSchema),
});
const lanesConfigSchema = z.object({
  version: z.literal(4),
  projects: z.array(activeProjectSchema),
});

export interface ActiveProject {
  id: string;
  name: string;
  remoteUrl: string;
  baseBranch: string;
  lanePathPattern: string;
  lanes: LaneDefinition[];
  environmentVariable: string;
  services: LaneServiceDefinition[];
  simulatorSlimming?: SimulatorSlimmingProfile;
  pullRequest?: PullRequestAutomation;
}

export interface PullRequestAutomation {
  model: string;
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
  version: 4;
  projects: ActiveProject[];
}

export function createLanesConfig(projects: ActiveProject[], installed?: LanesConfig): LanesConfig {
  const source = lanesConfigSchema.parse({ version: 4, projects });
  const merged = {
    version: 4 as const,
    projects: source.projects.map((project) => ({
      ...project,
      lanes: installed?.projects.find(({ id }) => id === project.id)?.lanes ?? project.lanes,
    })),
  };
  return lanesConfigSchema.parse(merged);
}

export function readLanesConfig(path: string): LanesConfig {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  const current = lanesConfigSchema.safeParse(value);
  if (current.success) return current.data;

  const legacy = legacyLanesConfigSchema.parse(value);
  return lanesConfigSchema.parse({
    version: 4,
    projects: legacy.projects.map((project) => ({
      ...project,
      lanePathPattern: inferLanePathPattern(project.lanes),
    })),
  });
}

export function writeLanesConfig(path: string, config: LanesConfig): void {
  const value = lanesConfigSchema.parse(config);
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporaryPath, path);
}

export function addLaneDefinition(
  config: LanesConfig,
  projectId: string,
  requestedNumber?: number,
): { config: LanesConfig; lane: LaneDefinition } {
  const project = config.projects.find(({ id }) => id === projectId);
  if (!project) throw new Error(`Unknown project: ${projectId}`);
  const used = new Set(project.lanes.map(({ number }) => number));
  const number = requestedNumber ?? firstAvailablePositiveInteger(used);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("Lane number must be positive");
  if (used.has(number)) throw new Error(`${projectId}/lane-${number} is already registered`);

  const lane = { number, path: project.lanePathPattern.replaceAll("{number}", String(number)) };
  const next = {
    ...config,
    projects: config.projects.map((candidate) =>
      candidate.id === projectId
        ? { ...candidate, lanes: [...candidate.lanes, lane].sort((a, b) => a.number - b.number) }
        : candidate,
    ),
  };
  return { config: lanesConfigSchema.parse(next), lane };
}

export function removeLaneDefinition(
  config: LanesConfig,
  projectId: string,
  laneId: string,
): LanesConfig {
  const number = Number(laneId.replace(/^lane-/, ""));
  const project = config.projects.find(({ id }) => id === projectId);
  if (!project) throw new Error(`Unknown project: ${projectId}`);
  if (!project.lanes.some((lane) => lane.number === number)) {
    throw new Error(`Unknown lane: ${projectId}/${laneId}`);
  }
  return lanesConfigSchema.parse({
    ...config,
    projects: config.projects.map((candidate) =>
      candidate.id === projectId
        ? { ...candidate, lanes: candidate.lanes.filter((lane) => lane.number !== number) }
        : candidate,
    ),
  });
}

function validateProject(
  { lanes, services }: { lanes: LaneDefinition[]; services: LaneServiceDefinition[] },
  context: z.RefinementCtx,
): void {
  if (new Set(lanes.map(({ number }) => number)).size !== lanes.length) {
    context.addIssue({ code: "custom", message: "Lane numbers must be unique" });
  }
  if (new Set(lanes.map(({ path }) => path)).size !== lanes.length) {
    context.addIssue({ code: "custom", message: "Lane paths must be unique" });
  }
  if (new Set(services.map(({ id }) => id)).size !== services.length) {
    context.addIssue({ code: "custom", message: "Lane service ids must be unique" });
  }
}

function inferLanePathPattern(lanes: LaneDefinition[]): string {
  const sample = lanes[0];
  if (!sample) throw new Error("Cannot migrate a project without a lane path");
  const suffix = String(sample.number);
  if (!sample.path.endsWith(suffix)) {
    throw new Error(`Cannot infer lane path pattern from ${sample.path}`);
  }
  return `${sample.path.slice(0, -suffix.length)}{number}`;
}

function firstAvailablePositiveInteger(used: Set<number>): number {
  let number = 1;
  while (used.has(number)) number += 1;
  return number;
}
