import { readFileSync } from "node:fs";

import { z } from "zod";

const activeProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  remoteUrl: z.string().url(),
  baseBranch: z.string().min(1),
  lanePaths: z.array(z.string().min(1)).min(1),
  environmentVariable: z.string().min(1),
});

const lanesConfigSchema = z.object({
  version: z.literal(1),
  projects: z.array(activeProjectSchema),
});

export interface ActiveProject {
  id: string;
  name: string;
  remoteUrl: string;
  baseBranch: string;
  lanePaths: string[];
  environmentVariable: string;
}

export interface LanesConfig {
  version: 1;
  projects: ActiveProject[];
}

export function createLanesConfig(projects: ActiveProject[]): LanesConfig {
  return lanesConfigSchema.parse({ version: 1, projects });
}

export function readLanesConfig(path: string): LanesConfig {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  return lanesConfigSchema.parse(value);
}
