import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { execa } from "execa";
import { z } from "zod";

import { readLanesConfig, type ActiveProject } from "./lanes-config";

const laneStateSchema = z.object({
  lastVerifiedAt: z.string().datetime().optional(),
  lastVerifiedHead: z.string().optional(),
  lastVerifiedRuntimeHash: z.string().optional(),
  lastError: z.string().optional(),
});

const registrySchema = z.object({
  version: z.literal(1),
  projects: z.record(z.string(), z.record(z.string(), laneStateSchema)),
});

export interface LaneState {
  lastVerifiedAt?: string;
  lastVerifiedHead?: string;
  lastVerifiedRuntimeHash?: string;
  lastError?: string;
}

export interface Lane {
  id: string;
  path: string;
  project: ActiveProject;
}

export type LaneStatusName = "ready" | "needs-attention" | "missing";

export interface LaneStatus {
  lane: Lane;
  state: LaneState;
  status: LaneStatusName;
  branch?: string;
  head?: string;
  reason?: string;
}

interface Registry {
  version: 1;
  projects: Record<string, Record<string, LaneState>>;
}

const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local/state");
export const LANES_CONFIG_PATH =
  process.env.LANES_CONFIG_PATH || join(configHome, "lanes/projects.json");
export const LANES_STATE_PATH = process.env.LANES_STATE_PATH || join(stateHome, "lanes/state.json");
const stateLockPath = process.env.LANES_STATE_LOCK_PATH || join(stateHome, "lanes/state.lock");
const projectEnvironmentRuntimeDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "project-environment",
);
const projectEnvironmentRuntimePath = join(projectEnvironmentRuntimeDirectory, "runtime.ts");
const requiredEnvironmentScripts = [
  "setup",
  "mobile-development",
  "verify",
  "reset",
  "destroy",
] as const;

function projectEnvironmentRuntimeHash(): string {
  const hash = createHash("sha256");
  for (const name of readdirSync(projectEnvironmentRuntimeDirectory)
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
    .sort()) {
    hash
      .update(name)
      .update("\0")
      .update(readFileSync(join(projectEnvironmentRuntimeDirectory, name)));
  }
  return hash.digest("hex");
}

function git(cwd: string, args: string[], allowFailure = false): string {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (allowFailure) return "";
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${message}`);
  }
}

function readRegistry(): Registry {
  if (!existsSync(LANES_STATE_PATH)) {
    return { version: 1, projects: {} };
  }

  const value: unknown = JSON.parse(readFileSync(LANES_STATE_PATH, "utf8"));
  return registrySchema.parse(value);
}

function writeRegistry(registry: Registry): void {
  mkdirSync(dirname(LANES_STATE_PATH), { recursive: true, mode: 0o700 });
  const temporaryPath = `${LANES_STATE_PATH}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(registry, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporaryPath, LANES_STATE_PATH);
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireStateLock(): void {
  mkdirSync(dirname(stateLockPath), { recursive: true, mode: 0o700 });

  try {
    mkdirSync(stateLockPath, { mode: 0o700 });
  } catch {
    const ownerPath = join(stateLockPath, "owner.json");
    const owner = existsSync(ownerPath)
      ? z
          .object({ pid: z.number().int().positive() })
          .safeParse(JSON.parse(readFileSync(ownerPath, "utf8")))
      : undefined;

    if (owner?.success && !processIsAlive(owner.data.pid)) {
      rmSync(stateLockPath, { recursive: true, force: true });
      mkdirSync(stateLockPath, { mode: 0o700 });
    } else {
      throw new Error("Project lane state is being changed by another process");
    }
  }

  writeFileSync(
    join(stateLockPath, "owner.json"),
    `${JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString() })}\n`,
    { mode: 0o600 },
  );
}

async function withRegistryLock<T>(callback: (registry: Registry) => Promise<T>): Promise<T> {
  acquireStateLock();
  try {
    const registry = readRegistry();
    const result = await callback(registry);
    writeRegistry(registry);
    return result;
  } finally {
    rmSync(stateLockPath, { recursive: true, force: true });
  }
}

export function getActiveProject(projectId: string): ActiveProject {
  const project = getActiveProjects().find(({ id }) => id === projectId);
  if (!project) throw new Error(`Unknown active project: ${projectId}`);
  return project;
}

export function getActiveProjects(): ActiveProject[] {
  if (!existsSync(LANES_CONFIG_PATH)) {
    throw new Error(`Lanes configuration is missing: ${LANES_CONFIG_PATH}. Run my-setup install.`);
  }
  return readLanesConfig(LANES_CONFIG_PATH).projects;
}

export function getProjectLanes(project: ActiveProject): Lane[] {
  return project.lanePaths.map((path, index) => ({ id: `lane-${index + 1}`, path, project }));
}

function stateFor(registry: Registry, lane: Lane): LaneState {
  registry.projects[lane.project.id] ??= {};
  registry.projects[lane.project.id][lane.id] ??= {};
  return registry.projects[lane.project.id][lane.id];
}

function inspectLane(lane: Lane, state: LaneState): LaneStatus {
  if (!existsSync(lane.path)) return { lane, state, status: "missing", reason: "clone missing" };

  const head = git(lane.path, ["rev-parse", "HEAD"], true);
  const branch = git(lane.path, ["branch", "--show-current"], true) || undefined;
  const changes = git(lane.path, ["status", "--porcelain=v1", "--untracked-files=all"], true);
  const operationPaths = [
    "MERGE_HEAD",
    "rebase-merge",
    "rebase-apply",
    "CHERRY_PICK_HEAD",
    "BISECT_LOG",
  ];
  const operation = operationPaths.find((path) => {
    const resolved = git(lane.path, ["rev-parse", "--git-path", path], true);
    return resolved && existsSync(resolve(lane.path, resolved));
  });

  if (changes) {
    return { lane, state, status: "needs-attention", branch, head, reason: "Git changes present" };
  }
  if (operation) {
    return {
      lane,
      state,
      status: "needs-attention",
      branch,
      head,
      reason: `Git ${operation} in progress`,
    };
  }
  if (branch) {
    return {
      lane,
      state,
      status: "needs-attention",
      branch,
      head,
      reason: "task branch still checked out",
    };
  }
  const missingScript = requiredEnvironmentScripts.find(
    (script) => !existsSync(join(lane.path, "scripts/project-lanes", `${script}.ts`)),
  );
  if (missingScript) {
    return {
      lane,
      state,
      status: "needs-attention",
      head,
      reason: `missing project environment entrypoint: ${missingScript}.ts`,
    };
  }
  if (state.lastVerifiedRuntimeHash !== projectEnvironmentRuntimeHash()) {
    return {
      lane,
      state,
      status: "needs-attention",
      head,
      reason: "shared project environment runtime changed",
    };
  }
  if (!state.lastVerifiedAt || state.lastVerifiedHead !== head) {
    return {
      lane,
      state,
      status: "needs-attention",
      head,
      reason: "environment verification required",
    };
  }

  return { lane, state, status: "ready", head };
}

async function runEnvironmentCommand(
  lane: Lane,
  script: "setup" | "mobile-development" | "verify" | "reset" | "destroy",
  extraArgs: string[] = [],
): Promise<void> {
  const scriptPath = join(lane.path, "scripts/project-lanes", `${script}.ts`);
  if (!existsSync(scriptPath)) throw new Error(`Missing project lane script: ${scriptPath}`);
  await execa("bun", [scriptPath, ...extraArgs], {
    cwd: lane.path,
    env: {
      ...process.env,
      PROJECT_LANE_DEFINITION_ROOT: lane.path,
      PROJECT_LANES_RUNTIME_MODULE: pathToFileURL(projectEnvironmentRuntimePath).href,
      [lane.project.environmentVariable]: lane.path,
    },
    stdio: "inherit",
  });
}

async function verifyLane(lane: Lane, state: LaneState, mobile = true): Promise<void> {
  await runEnvironmentCommand(lane, "verify", mobile ? ["--mobile-development"] : []);
  state.lastVerifiedAt = new Date().toISOString();
  state.lastVerifiedHead = git(lane.path, ["rev-parse", "HEAD"]);
  state.lastVerifiedRuntimeHash = projectEnvironmentRuntimeHash();
  delete state.lastError;
}

export async function setupProjectLanes(projectId?: string): Promise<void> {
  const projects = projectId ? [getActiveProject(projectId)] : getActiveProjects();
  const failures: string[] = [];
  await withRegistryLock(async (registry) => {
    for (const project of projects) {
      for (const lane of getProjectLanes(project)) {
        mkdirSync(dirname(lane.path), { recursive: true });
        const state = stateFor(registry, lane);
        try {
          if (!existsSync(lane.path)) {
            git(dirname(lane.path), [
              "clone",
              "--no-local",
              "--branch",
              project.baseBranch,
              project.remoteUrl,
              lane.path,
            ]);
          } else {
            const current = inspectLane(lane, state);
            if (current.branch || current.reason === "Git changes present") {
              throw new Error(`${project.id}/${lane.id} is not safe to reprovision`);
            }
          }
          git(lane.path, ["fetch", "origin", project.baseBranch]);
          git(lane.path, ["switch", "--detach", `origin/${project.baseBranch}`]);
          await runEnvironmentCommand(lane, "setup");
          await runEnvironmentCommand(lane, "mobile-development");
          await verifyLane(lane, state);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          state.lastError = message;
          failures.push(`${project.id}/${lane.id}: ${message}`);
        }
      }
    }
  });
  if (failures.length > 0) {
    throw new Error(`Project lane setup failed:\n${failures.join("\n")}`);
  }
}

export function listProjectLaneStatuses(projectId?: string): LaneStatus[] {
  const registry = readRegistry();
  const projects = projectId ? [getActiveProject(projectId)] : getActiveProjects();
  return projects.flatMap((project) =>
    getProjectLanes(project).map((lane) => inspectLane(lane, stateFor(registry, lane))),
  );
}

export async function verifyProjectLanes(projectId?: string): Promise<void> {
  const projects = projectId ? [getActiveProject(projectId)] : getActiveProjects();
  const failures: string[] = [];
  await withRegistryLock(async (registry) => {
    for (const project of projects) {
      for (const lane of getProjectLanes(project)) {
        const state = stateFor(registry, lane);
        try {
          await verifyLane(lane, state);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          state.lastError = message;
          failures.push(`${project.id}/${lane.id}: ${message}`);
        }
      }
    }
  });
  if (failures.length > 0) {
    throw new Error(`Project lane verification failed:\n${failures.join("\n")}`);
  }
}

export async function resetProjectLane(projectId: string, laneId: string): Promise<void> {
  await withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const lane = getProjectLanes(project).find(({ id }) => id === laneId);
    if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    const state = stateFor(registry, lane);
    const status = inspectLane(lane, state);
    if (status.branch || status.reason === "Git changes present") {
      throw new Error(`${projectId}/${laneId} is not Git-empty`);
    }
    await runEnvironmentCommand(lane, "reset");
    await verifyLane(lane, state);
  });
}

export async function destroyProjectLane(
  projectId: string,
  laneId: string,
  confirmed: boolean,
): Promise<void> {
  if (!confirmed) throw new Error("Pass --confirm to destroy a persistent project lane");
  await withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const lane = getProjectLanes(project).find(({ id }) => id === laneId);
    if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    const state = stateFor(registry, lane);
    const status = inspectLane(lane, state);
    if (
      status.status === "needs-attention" &&
      status.reason !== "environment verification required"
    ) {
      throw new Error(`${projectId}/${laneId} needs attention: ${status.reason}`);
    }
    await runEnvironmentCommand(lane, "destroy");
    rmSync(lane.path, { recursive: true });
    delete registry.projects[project.id]?.[lane.id];
  });
}
