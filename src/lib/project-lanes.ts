import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { execa } from "execa";
import { z } from "zod";

import { ACTIVE_PROJECTS, type ActiveProject } from "../../config/active-projects";

const leaseSchema = z.object({
  task: z.string().min(1),
  branch: z.string().min(1),
  owner: z.string().min(1),
  acquiredAt: z.string().datetime(),
});

const laneStateSchema = z.object({
  lease: leaseSchema.optional(),
  lastVerifiedAt: z.string().datetime().optional(),
  lastVerifiedHead: z.string().optional(),
  lastReleasedAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
});

const registrySchema = z.object({
  version: z.literal(1),
  projects: z.record(z.string(), z.record(z.string(), laneStateSchema)),
});

export interface LaneLease {
  task: string;
  branch: string;
  owner: string;
  acquiredAt: string;
}

export interface LaneState {
  lease?: LaneLease;
  lastVerifiedAt?: string;
  lastVerifiedHead?: string;
  lastReleasedAt?: string;
  lastError?: string;
}

export interface Lane {
  id: string;
  path: string;
  project: ActiveProject;
}

export type LaneStatusName = "ready" | "in-use" | "needs-attention" | "missing";

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

const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local/state");
export const PROJECT_LANES_STATE_PATH = join(stateHome, "my-setup/active-project-lanes.json");
const stateLockPath = join(stateHome, "my-setup/active-project-lanes.lock");

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

function gitSucceeds(cwd: string, args: string[]): boolean {
  try {
    execFileSync("git", args, { cwd, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function readRegistry(): Registry {
  if (!existsSync(PROJECT_LANES_STATE_PATH)) {
    return { version: 1, projects: {} };
  }

  const value: unknown = JSON.parse(readFileSync(PROJECT_LANES_STATE_PATH, "utf8"));
  return registrySchema.parse(value);
}

function writeRegistry(registry: Registry): void {
  mkdirSync(dirname(PROJECT_LANES_STATE_PATH), { recursive: true, mode: 0o700 });
  const temporaryPath = `${PROJECT_LANES_STATE_PATH}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(registry, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporaryPath, PROJECT_LANES_STATE_PATH);
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
  const project = ACTIVE_PROJECTS.find(({ id }) => id === projectId);
  if (!project) throw new Error(`Unknown active project: ${projectId}`);
  return project;
}

export function getProjectLanes(project: ActiveProject): Lane[] {
  return Array.from({ length: project.laneCount }, (_, index) => {
    const id = `lane-${index + 1}`;
    return { id, path: join(project.laneRoot, id), project };
  });
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

  if (state.lease) {
    return { lane, state, status: "in-use", branch, head };
  }
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

export function chooseReadyLane(statuses: LaneStatus[]): LaneStatus {
  const ready = statuses.find(({ status }) => status === "ready");
  if (ready) return ready;
  throw new Error("No project lane is ready");
}

async function runEnvironmentCommand(
  lane: Lane,
  script: "setup" | "mobile-development" | "verify" | "reset" | "destroy",
  extraArgs: string[] = [],
): Promise<void> {
  const scriptPath = join(lane.project.repository, "scripts/project-lanes", `${script}.ts`);
  if (!existsSync(scriptPath)) throw new Error(`Missing project lane script: ${scriptPath}`);
  await execa("bun", [scriptPath, ...extraArgs], {
    cwd: lane.project.repository,
    env: {
      ...process.env,
      PROJECT_LANE_DEFINITION_ROOT: lane.project.repository,
      [lane.project.environmentVariable]: lane.path,
    },
    stdio: "inherit",
  });
}

async function verifyLane(lane: Lane, state: LaneState, mobile = true): Promise<void> {
  await runEnvironmentCommand(lane, "verify", mobile ? ["--mobile-development"] : []);
  state.lastVerifiedAt = new Date().toISOString();
  state.lastVerifiedHead = git(lane.path, ["rev-parse", "HEAD"]);
  delete state.lastError;
}

export async function setupProjectLanes(projectId?: string): Promise<void> {
  const projects = projectId ? [getActiveProject(projectId)] : ACTIVE_PROJECTS;
  const failures: string[] = [];
  await withRegistryLock(async (registry) => {
    for (const project of projects) {
      mkdirSync(project.laneRoot, { recursive: true });
      const remote = git(project.repository, ["remote", "get-url", "origin"]);
      for (const lane of getProjectLanes(project)) {
        const state = stateFor(registry, lane);
        try {
          if (!existsSync(lane.path)) {
            git(project.laneRoot, [
              "clone",
              "--no-local",
              "--branch",
              project.baseBranch,
              project.repository,
              lane.path,
            ]);
            git(lane.path, ["remote", "set-url", "origin", remote]);
          } else {
            const current = inspectLane(lane, state);
            if (current.status === "in-use") continue;
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
  const projects = projectId ? [getActiveProject(projectId)] : ACTIVE_PROJECTS;
  return projects.flatMap((project) =>
    getProjectLanes(project).map((lane) => inspectLane(lane, stateFor(registry, lane))),
  );
}

function branchExists(lane: Lane, ref: string): boolean {
  return gitSucceeds(lane.path, ["show-ref", "--verify", "--quiet", ref]);
}

export async function acquireProjectLane(
  projectId: string,
  branch: string,
  task: string,
  owner: string,
): Promise<LaneStatus> {
  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.startsWith("-") || branch.includes("..")) {
    throw new Error(`Unsafe branch name: ${branch}`);
  }

  return withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const statuses = getProjectLanes(project).map((lane) =>
      inspectLane(lane, stateFor(registry, lane)),
    );
    const selected = chooseReadyLane(statuses);
    const { lane, state } = selected;
    await verifyLane(lane, state);
    git(lane.path, ["fetch", "origin", project.baseBranch]);

    const localRef = `refs/heads/${branch}`;
    const remoteRef = `refs/remotes/origin/${branch}`;
    if (branchExists(lane, localRef)) {
      git(lane.path, ["switch", branch]);
    } else if (branchExists(lane, remoteRef)) {
      git(lane.path, ["switch", "--track", "-c", branch, `origin/${branch}`]);
    } else {
      git(lane.path, ["switch", "-c", branch, `origin/${project.baseBranch}`]);
    }

    state.lease = { task, branch, owner, acquiredAt: new Date().toISOString() };
    delete state.lastVerifiedAt;
    delete state.lastVerifiedHead;
    return inspectLane(lane, state);
  });
}

export async function releaseProjectLane(projectId: string, laneId: string): Promise<void> {
  await withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const lane = getProjectLanes(project).find(({ id }) => id === laneId);
    if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    const state = stateFor(registry, lane);
    const changes = git(lane.path, ["status", "--porcelain=v1", "--untracked-files=all"]);
    if (changes) throw new Error(`${projectId}/${laneId} has Git changes`);

    const branch = git(lane.path, ["branch", "--show-current"]);
    if (branch) {
      const upstream = git(lane.path, ["rev-parse", "--abbrev-ref", "@{upstream}"], true);
      if (!upstream) throw new Error(`${branch} has no upstream; push it before release`);
      const counts = git(lane.path, ["rev-list", "--left-right", "--count", `HEAD...${upstream}`]);
      const [ahead] = counts.split(/\s+/).map(Number);
      if (ahead > 0) throw new Error(`${branch} has ${ahead} unpushed commit(s)`);
    }

    git(lane.path, ["fetch", "origin", project.baseBranch]);
    git(lane.path, ["switch", "--detach", `origin/${project.baseBranch}`]);
    if (branch) git(lane.path, ["branch", "-D", branch]);
    await runEnvironmentCommand(lane, "reset");
    await verifyLane(lane, state);
    delete state.lease;
    state.lastReleasedAt = new Date().toISOString();
  });
}

export async function verifyProjectLanes(projectId?: string): Promise<void> {
  const projects = projectId ? [getActiveProject(projectId)] : ACTIVE_PROJECTS;
  const failures: string[] = [];
  await withRegistryLock(async (registry) => {
    for (const project of projects) {
      for (const lane of getProjectLanes(project)) {
        const state = stateFor(registry, lane);
        if (state.lease) continue;
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
    if (state.lease) throw new Error(`${projectId}/${laneId} is in use`);
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
    if (state.lease) throw new Error(`${projectId}/${laneId} is in use`);
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
