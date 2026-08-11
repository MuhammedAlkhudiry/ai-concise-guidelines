import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { rm as rmAsync } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { execa } from "execa";
import { z } from "zod";

import {
  activeProjectSchema,
  addLaneDefinition,
  readLanesConfig,
  removeLaneDefinition,
  writeLanesConfig,
  type ActiveProject,
} from "./lanes-config";
import {
  assertAlwaysEnabledServices,
  assertSimSlimProfile,
  assertSupportedSimSlimVersion,
  disabledLabels,
  expectedDisabledLabels,
  parseSimSlimCategories,
  parseDisabledLaunchdLabels,
  parseSimSlimStatus,
  SIMSLIM_INSTALL_COMMAND,
  simSlimOffArgs,
  simSlimOnArgs,
  type SimSlimCategory,
} from "./project-environment/simslim";
import { findSimulator, type SimulatorDevice } from "./project-environment/simulator";
import { verifyExpoDevelopmentClientFreshness } from "./project-environment/expo";
import type { SimulatorSlimmingProfile } from "./project-environment/types";

const laneStateSchema = z.object({
  lastVerifiedAt: z.string().datetime().optional(),
  lastVerifiedHead: z.string().optional(),
  lastVerifiedRuntimeHash: z.string().optional(),
  lastVerifiedProjectHash: z.string().optional(),
  lastError: z.string().optional(),
  lastErrorAt: z.string().datetime().optional(),
});

const registrySchema = z.object({
  version: z.literal(1),
  projects: z.record(z.string(), z.record(z.string(), laneStateSchema)),
});

export interface LaneState {
  lastVerifiedAt?: string;
  lastVerifiedHead?: string;
  lastVerifiedRuntimeHash?: string;
  lastVerifiedProjectHash?: string;
  lastError?: string;
  lastErrorAt?: string;
}

export interface Lane {
  id: string;
  number: number;
  path: string;
  project: ActiveProject;
}

export type LaneAvailability = "available" | "occupied";
export type LaneHealth = "ready" | "drifted" | "broken";

export interface LaneStatus {
  lane: Lane;
  state: LaneState;
  availability: LaneAvailability;
  health: LaneHealth;
  branch?: string;
  head?: string;
  baseBranchAhead?: number;
  baseBranchBehind?: number;
  gitDiff?: LaneGitDiff;
  occupancyReason?: string;
  healthReason?: string;
}

export interface LaneGitDiff {
  additions: number;
  deletions: number;
  untrackedFiles: number;
}

export interface GitDivergence {
  ahead: number;
  behind: number;
}

export function parseGitDivergence(value: string): GitDivergence | undefined {
  const [ahead, behind] = value.trim().split(/\s+/);
  if (!/^\d+$/.test(ahead) || !/^\d+$/.test(behind)) return undefined;
  return { ahead: Number(ahead), behind: Number(behind) };
}

interface LaneOccupancyInput {
  operation?: string;
  hasChanges: boolean;
  branch?: string;
  baseBranch: string;
  baseBranchAhead?: number;
}

export function laneOccupancyReason({
  operation,
  hasChanges,
  branch,
  baseBranch,
  baseBranchAhead,
}: LaneOccupancyInput): string | undefined {
  if (operation) return `Git ${operation} in progress`;
  if (hasChanges) return "Git changes present";
  if (branch && branch !== baseBranch) return "task branch checked out";
  if (baseBranchAhead === 0) return undefined;
  if (baseBranchAhead === undefined) {
    return `could not compare ${baseBranch} with origin/${baseBranch}`;
  }
  return `${baseBranchAhead} local commit${baseBranchAhead === 1 ? "" : "s"} outside origin/${baseBranch}`;
}

export type SimulatorSlimmingMode = "project" | "full";

export interface LaneSimulatorSlimmingStatus {
  project: string;
  lane: string;
  simulatorName: string;
  udid?: string;
  initialState?: string;
  mode: SimulatorSlimmingMode;
  expectedDisabled?: number;
  actualDisabled?: number;
  matchesProfile?: boolean;
  error?: string;
}

export interface SimulatorFleetReport {
  operation: "status" | "apply" | "restore";
  simulators: LaneSimulatorSlimmingStatus[];
}

interface Registry {
  version: 1;
  projects: Record<string, Record<string, LaneState>>;
}

const laneCleanupJobSchema = z.object({
  id: z.string().min(1),
  project: activeProjectSchema,
  laneId: z.string().regex(/^lane-\d+$/),
  laneNumber: z.number().int().positive(),
  originalPath: z.string().min(1),
  cleanupPath: z.string().min(1),
  phase: z.enum(["preparing", "ready", "cleaning", "deleting"]),
  createdAt: z.string().datetime(),
  attempts: z.number().int().nonnegative(),
  lastAttemptAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
});

const laneCleanupQueueSchema = z.object({
  version: z.literal(1),
  jobs: z.array(laneCleanupJobSchema),
});

export type LaneCleanupJob = z.infer<typeof laneCleanupJobSchema>;

interface LaneCleanupQueue {
  version: 1;
  jobs: LaneCleanupJob[];
}

const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local/state");
export const LANES_CONFIG_PATH =
  process.env.LANES_CONFIG_PATH || join(configHome, "lanes/projects.json");
export const LANES_STATE_PATH = process.env.LANES_STATE_PATH || join(stateHome, "lanes/state.json");
const stateLockPath = process.env.LANES_STATE_LOCK_PATH || join(stateHome, "lanes/state.lock");
export const LANES_CLEANUP_PATH =
  process.env.LANES_CLEANUP_PATH || join(stateHome, "lanes/cleanup.json");
const cleanupWorkerLockPath =
  process.env.LANES_CLEANUP_LOCK_PATH || join(stateHome, "lanes/cleanup.lock");
const registryLockRetryDelayMs = 50;
const registryLockTimeoutMs = 10_000;
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

function projectEnvironmentProjectHash(lane: Lane): string {
  const hash = createHash("sha256");
  hash.update(
    JSON.stringify({
      environmentVariable: lane.project.environmentVariable,
      services: lane.project.services,
      simulatorSlimming: lane.project.simulatorSlimming,
    }),
  );
  const scriptsDirectory = join(lane.path, "scripts/project-lanes");
  if (!existsSync(scriptsDirectory)) return hash.digest("hex");
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && entry.name.endsWith(".ts")) {
        hash.update(path.slice(scriptsDirectory.length)).update("\0").update(readFileSync(path));
      }
    }
  };
  visit(scriptsDirectory);
  return hash.digest("hex");
}

export function summarizeLaneError(error: string): string {
  const lines = error
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const explicit = lines.find(
    (line) => /^(?:error:|Error:)/.test(line) && !/^error:\s*['"]?\//i.test(line),
  );
  const command = lines.find((line) => line.startsWith("Command failed with exit code"));
  return (explicit ?? command ?? lines[0] ?? "environment command failed")
    .replace(/^error:\s*/i, "")
    .slice(0, 240);
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

async function gitAsync(cwd: string, args: string[], allowFailure = false): Promise<string> {
  const result = await execa("git", args, { cwd, reject: false });
  if (result.exitCode === 0) return result.stdout.trim();
  if (allowFailure) return "";
  throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${result.stderr.trim()}`);
}

export function assertLaneTaskBranch(baseBranch: string, branch: string): void {
  if (branch !== branch.trim() || !branch) {
    throw new Error("Task branch must be a non-empty Git branch name without surrounding spaces");
  }
  if (branch === baseBranch) {
    throw new Error(`Task branch must differ from the base branch ${baseBranch}`);
  }
  try {
    execFileSync("git", ["check-ref-format", "--branch", branch], {
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    throw new Error(`Invalid task branch name: ${branch}`);
  }
}

function configureLaneGitSafety(lane: Lane): void {
  git(lane.path, ["config", "--local", "branch.autoSetupMerge", "false"]);
  git(lane.path, ["config", "--local", "push.default", "current"]);

  const branches = git(lane.path, [
    "for-each-ref",
    "--format=%(refname:short)%09%(upstream:short)",
    "refs/heads",
  ]);
  for (const line of branches.split("\n")) {
    const [branch, upstream] = line.split("\t");
    if (
      branch &&
      branch !== lane.project.baseBranch &&
      upstream === `origin/${lane.project.baseBranch}`
    ) {
      git(lane.path, ["branch", "--unset-upstream", branch]);
    }
  }
}

export function prepareLaneGit(lane: Lane, branch?: string): void {
  configureLaneGitSafety(lane);
  git(lane.path, ["fetch", "origin", lane.project.baseBranch]);
  if (branch) {
    assertLaneTaskBranch(lane.project.baseBranch, branch);
    git(lane.path, [
      "switch",
      "--no-track",
      "--create",
      branch,
      `origin/${lane.project.baseBranch}`,
    ]);
    return;
  }
  git(lane.path, ["switch", "--detach", `origin/${lane.project.baseBranch}`]);
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
  writeFileSync(temporaryPath, `${JSON.stringify(registry, null, 2)}\n`, {
    mode: 0o600,
  });
  renameSync(temporaryPath, LANES_STATE_PATH);
}

function readCleanupQueue(): LaneCleanupQueue {
  if (!existsSync(LANES_CLEANUP_PATH)) return { version: 1, jobs: [] };
  const value: unknown = JSON.parse(readFileSync(LANES_CLEANUP_PATH, "utf8"));
  return laneCleanupQueueSchema.parse(value);
}

function writeCleanupQueue(queue: LaneCleanupQueue): void {
  const value = laneCleanupQueueSchema.parse(queue);
  mkdirSync(dirname(LANES_CLEANUP_PATH), { recursive: true, mode: 0o700 });
  const temporaryPath = `${LANES_CLEANUP_PATH}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporaryPath, LANES_CLEANUP_PATH);
}

export function listProjectLaneCleanupJobs(): LaneCleanupJob[] {
  return readCleanupQueue().jobs;
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function tryAcquireCleanupWorkerLock(): boolean {
  mkdirSync(dirname(cleanupWorkerLockPath), { recursive: true, mode: 0o700 });
  try {
    mkdirSync(cleanupWorkerLockPath, { mode: 0o700 });
  } catch {
    const ownerPath = join(cleanupWorkerLockPath, "owner.json");
    const owner = (() => {
      if (!existsSync(ownerPath)) return undefined;
      try {
        return z
          .object({ pid: z.number().int().positive() })
          .safeParse(JSON.parse(readFileSync(ownerPath, "utf8")));
      } catch {
        return undefined;
      }
    })();
    const abandoned =
      !owner?.success && Date.now() - statSync(cleanupWorkerLockPath).mtimeMs > 5_000;
    if ((!owner?.success && !abandoned) || (owner?.success && processIsAlive(owner.data.pid))) {
      return false;
    }
    rmSync(cleanupWorkerLockPath, { recursive: true, force: true });
    mkdirSync(cleanupWorkerLockPath, { mode: 0o700 });
  }
  writeFileSync(
    join(cleanupWorkerLockPath, "owner.json"),
    `${JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString() })}\n`,
    { mode: 0o600 },
  );
  return true;
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

async function withRegistryLockWhenAvailable<T>(
  callback: (registry: Registry) => Promise<T>,
): Promise<T> {
  const deadline = Date.now() + registryLockTimeoutMs;
  while (true) {
    try {
      return await withRegistryLock(callback);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== "Project lane state is being changed by another process" ||
        Date.now() >= deadline
      ) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, registryLockRetryDelayMs));
    }
  }
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

async function updateCleanupQueue(update: (queue: LaneCleanupQueue) => void): Promise<void> {
  await withRegistryLockWhenAvailable(async () => {
    const queue = readCleanupQueue();
    update(queue);
    writeCleanupQueue(queue);
  });
}

function cleanupJobLane(job: LaneCleanupJob, path: string): Lane {
  return {
    id: job.laneId,
    number: job.laneNumber,
    path,
    project: job.project,
  };
}

function cleanupSourcePath(job: LaneCleanupJob): string | undefined {
  if (existsSync(job.cleanupPath)) return job.cleanupPath;
  if (existsSync(job.originalPath)) return job.originalPath;
  return undefined;
}

function laneIsRegistered(job: LaneCleanupJob): boolean {
  if (!existsSync(LANES_CONFIG_PATH)) return true;
  const project = readLanesConfig(LANES_CONFIG_PATH).projects.find(
    ({ id }) => id === job.project.id,
  );
  return Boolean(project?.lanes.some(({ number }) => number === job.laneNumber));
}

async function reconcilePreparingCleanupJobs(): Promise<void> {
  await updateCleanupQueue((queue) => {
    queue.jobs = queue.jobs.filter((job) => {
      if (job.phase !== "preparing") return true;
      if (!laneIsRegistered(job)) {
        job.phase = "ready";
        delete job.lastError;
        return true;
      }
      try {
        if (existsSync(job.cleanupPath) && !existsSync(job.originalPath)) {
          renameSync(job.cleanupPath, job.originalPath);
        }
        if (existsSync(job.originalPath)) return false;
        job.lastError = "Could not restore the registered lane after interrupted removal";
      } catch (error) {
        job.lastError = error instanceof Error ? error.message : String(error);
      }
      return true;
    });
  });
}

async function processCleanupJob(job: LaneCleanupJob): Promise<void> {
  let phase = job.phase;
  try {
    if (phase === "ready" || phase === "cleaning") {
      const path = cleanupSourcePath(job);
      if (!path) throw new Error(`Cleanup source is missing: ${job.cleanupPath}`);
      phase = "cleaning";
      await updateCleanupQueue((queue) => {
        const current = queue.jobs.find(({ id }) => id === job.id);
        if (!current) return;
        current.phase = "cleaning";
        current.attempts += 1;
        current.lastAttemptAt = new Date().toISOString();
        delete current.lastError;
      });
      await runEnvironmentCommand(cleanupJobLane(job, path), "destroy", [], true);
      phase = "deleting";
      await updateCleanupQueue((queue) => {
        const current = queue.jobs.find(({ id }) => id === job.id);
        if (current) current.phase = "deleting";
      });
    }

    const path = cleanupSourcePath(job);
    if (path) await rmAsync(path, { recursive: true, force: true });
    await updateCleanupQueue((queue) => {
      queue.jobs = queue.jobs.filter(({ id }) => id !== job.id);
    });
  } catch (error) {
    await updateCleanupQueue((queue) => {
      const current = queue.jobs.find(({ id }) => id === job.id);
      if (!current) return;
      current.phase = phase === "deleting" ? "deleting" : "ready";
      current.lastError = error instanceof Error ? error.message : String(error);
    });
  }
}

export async function runProjectLaneCleanupJobs(): Promise<LaneCleanupJob[]> {
  if (!tryAcquireCleanupWorkerLock()) return listProjectLaneCleanupJobs();
  const attempted = new Set<string>();
  try {
    await reconcilePreparingCleanupJobs();
    while (true) {
      const jobs = listProjectLaneCleanupJobs().filter(
        (job) =>
          !attempted.has(job.id) &&
          (job.phase === "ready" || job.phase === "cleaning" || job.phase === "deleting"),
      );
      if (jobs.length === 0) break;
      jobs.forEach(({ id }) => attempted.add(id));
      await Promise.all(jobs.map(processCleanupJob));
    }
    return listProjectLaneCleanupJobs();
  } finally {
    rmSync(cleanupWorkerLockPath, { recursive: true, force: true });
  }
}

export function startProjectLaneCleanupWorker(): void {
  if (process.env.LANES_CLEANUP_WORKER === "1" || readCleanupQueue().jobs.length === 0) return;
  const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), "../commands/lanes-cli.ts");
  const child = spawn(process.execPath, [scriptPath, "cleanup", "run"], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, LANES_CLEANUP_WORKER: "1" },
  });
  child.unref();
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
  return project.lanes.map(({ number, path }) => ({
    id: `lane-${number}`,
    number,
    path,
    project,
  }));
}

export function selectProjectLane(
  projects: ActiveProject[],
  options: { projectId?: string; laneId?: string; cwd?: string } = {},
): Lane {
  const { projectId, laneId, cwd = process.cwd() } = options;
  if (laneId && !projectId) {
    throw new Error("A lane id requires a project id");
  }

  const selected = projectId ? projects.filter((project) => project.id === projectId) : projects;
  if (projectId && selected.length === 0) {
    throw new Error(`Unknown active project: ${projectId}`);
  }

  const lanes = selected.flatMap(getProjectLanes);
  if (projectId && laneId) {
    const explicit = lanes.find(({ id }) => id === laneId);
    if (!explicit) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    return explicit;
  }

  const resolvedCwd = resolve(cwd);
  const current = lanes.find(({ path }) => {
    const resolvedPath = resolve(path);
    return resolvedCwd === resolvedPath || resolvedCwd.startsWith(`${resolvedPath}${sep}`);
  });
  if (current) return current;

  throw new Error(
    projectId
      ? `Current directory is not a ${projectId} lane; pass an explicit lane id or use lanes audit ${projectId}`
      : "Current directory is not a configured lane; pass a project and lane or use lanes audit",
  );
}

function selectedProjects(projectId?: string): ActiveProject[] {
  return projectId ? [getActiveProject(projectId)] : getActiveProjects();
}

function projectSlimmingProfile(
  project: ActiveProject,
  mode: SimulatorSlimmingMode,
): SimulatorSlimmingProfile {
  if (mode === "full") return { exceptCategories: [], keepServices: [] };
  if (!project.simulatorSlimming) {
    throw new Error(`${project.id} has no configured simulator slimming profile`);
  }
  return {
    exceptCategories: project.simulatorSlimming.exceptCategories,
    keepServices: project.simulatorSlimming.keepServices ?? [],
  };
}

async function simSlim(args: string[]): Promise<string> {
  try {
    return (await execa("simslim", args, { env: process.env })).stdout;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ENOENT")) {
      throw new Error(`SimSlim is unavailable. Run: ${SIMSLIM_INSTALL_COMMAND}`);
    }
    throw new Error(`SimSlim failed: ${message}`);
  }
}

async function simSlimCategories(): Promise<SimSlimCategory[]> {
  assertSupportedSimSlimVersion(await simSlim(["--version"]));
  return parseSimSlimCategories(await simSlim(["profiles", "--json"]));
}

async function configuredSimulator(lane: Lane): Promise<SimulatorDevice> {
  const result = await execa("xcrun", ["simctl", "list", "-j", "devices"], {
    env: process.env,
  });
  const state = z
    .object({
      devices: z.record(
        z.string(),
        z.array(
          z.object({
            name: z.string(),
            udid: z.string().optional(),
            state: z.string().optional(),
            isAvailable: z.boolean().optional(),
          }),
        ),
      ),
    })
    .parse(JSON.parse(result.stdout));
  const simulator = findSimulator(state, `${lane.project.name} Lane ${lane.number}`);
  if (!simulator?.udid) {
    throw new Error(`Simulator ${lane.project.name} Lane ${lane.number} is missing`);
  }
  return simulator;
}

async function inspectSimulatorProfile(
  lane: Lane,
  mode: SimulatorSlimmingMode,
  categories: SimSlimCategory[],
  profileOverride?: SimulatorSlimmingProfile,
): Promise<LaneSimulatorSlimmingStatus> {
  const profile = profileOverride ?? projectSlimmingProfile(lane.project, mode);
  const expected = expectedDisabledLabels(categories, profile);
  const simulator = await configuredSimulator(lane);
  const initialState = simulator.state;
  const wasBooted = initialState === "Booted";
  try {
    if (!wasBooted) {
      await execa("xcrun", ["simctl", "boot", simulator.udid!], {
        env: process.env,
      });
      await execa("xcrun", ["simctl", "bootstatus", simulator.udid!, "-b"], {
        env: process.env,
      });
    }
    const status = parseSimSlimStatus(
      await simSlim(["status", simulator.udid!, "--dropped", "--json"]),
    );
    let matchesProfile = true;
    try {
      assertSimSlimProfile(categories, status, profile);
      const launchd = await execa("xcrun", [
        "simctl",
        "spawn",
        simulator.udid!,
        "launchctl",
        "print-disabled",
        "system",
      ]);
      assertAlwaysEnabledServices(categories, parseDisabledLaunchdLabels(launchd.stdout));
    } catch {
      matchesProfile = false;
    }
    return {
      project: lane.project.id,
      lane: lane.id,
      simulatorName: simulator.name,
      udid: simulator.udid,
      initialState,
      mode,
      expectedDisabled: expected.length,
      actualDisabled: disabledLabels(status).length,
      matchesProfile,
    };
  } finally {
    if (!wasBooted) {
      await execa("xcrun", ["simctl", "shutdown", simulator.udid!], {
        env: process.env,
      });
    }
  }
}

async function simulatorFleetOperation(
  operation: SimulatorFleetReport["operation"],
  projectId?: string,
  mode: SimulatorSlimmingMode = "project",
): Promise<SimulatorFleetReport> {
  const categories = await simSlimCategories();
  const simulators: LaneSimulatorSlimmingStatus[] = [];
  for (const project of selectedProjects(projectId)) {
    for (const lane of getProjectLanes(project)) {
      const base = {
        project: project.id,
        lane: lane.id,
        simulatorName: `${project.name} Lane ${lane.number}`,
        mode,
      };
      try {
        const simulator = await configuredSimulator(lane);
        if (operation === "apply") {
          const profile = projectSlimmingProfile(project, mode);
          expectedDisabledLabels(categories, profile);
          await simSlim(simSlimOnArgs(simulator.udid!, profile, true));
        } else if (operation === "restore") {
          await simSlim(simSlimOffArgs(simulator.udid!, true));
        }

        if (operation === "restore") {
          simulators.push(
            await inspectSimulatorProfile(lane, mode, categories, {
              exceptCategories: categories.map(({ id }) => id),
              keepServices: [],
            }),
          );
        } else {
          simulators.push(await inspectSimulatorProfile(lane, mode, categories));
        }
      } catch (error) {
        simulators.push({
          ...base,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return { operation, simulators };
}

export function statusLaneSimulators(
  projectId?: string,
  mode: SimulatorSlimmingMode = "project",
): Promise<SimulatorFleetReport> {
  return simulatorFleetOperation("status", projectId, mode);
}

export function applyLaneSimulatorSlimming(
  projectId?: string,
  mode: SimulatorSlimmingMode = "project",
): Promise<SimulatorFleetReport> {
  return simulatorFleetOperation("apply", projectId, mode);
}

export function restoreLaneSimulators(projectId?: string): Promise<SimulatorFleetReport> {
  return simulatorFleetOperation("restore", projectId);
}

export function simulatorFleetFailures(
  report: SimulatorFleetReport,
): LaneSimulatorSlimmingStatus[] {
  return report.simulators.filter(({ error, matchesProfile }) => error || matchesProfile === false);
}

function stateFor(registry: Registry, lane: Lane): LaneState {
  registry.projects[lane.project.id] ??= {};
  registry.projects[lane.project.id][lane.id] ??= {};
  return registry.projects[lane.project.id][lane.id];
}

function reprovisionSafetyError(lane: Lane): string {
  return `${lane.project.id}/${lane.id} is not safe to reprovision`;
}

function laneHealthError(lane: Lane, state: LaneState): string | undefined {
  return state.lastError === reprovisionSafetyError(lane) ? undefined : state.lastError;
}

function inspectGitDiff(cwd: string, changes: string): LaneGitDiff | undefined {
  if (!changes) return undefined;

  let additions = 0;
  let deletions = 0;
  for (const line of git(cwd, ["diff", "--numstat", "HEAD", "--"], true).split("\n")) {
    const [added, deleted] = line.split("\t");
    if (/^\d+$/.test(added)) additions += Number(added);
    if (/^\d+$/.test(deleted)) deletions += Number(deleted);
  }

  return {
    additions,
    deletions,
    untrackedFiles: changes.split("\n").filter((line) => line.startsWith("?? ")).length,
  };
}

async function inspectGitDiffAsync(cwd: string, changes: string): Promise<LaneGitDiff | undefined> {
  if (!changes) return undefined;

  let additions = 0;
  let deletions = 0;
  const numstat = await gitAsync(cwd, ["diff", "--numstat", "HEAD", "--"], true);
  for (const line of numstat.split("\n")) {
    const [added, deleted] = line.split("\t");
    if (/^\d+$/.test(added)) additions += Number(added);
    if (/^\d+$/.test(deleted)) deletions += Number(deleted);
  }

  return {
    additions,
    deletions,
    untrackedFiles: changes.split("\n").filter((line) => line.startsWith("?? ")).length,
  };
}

function activeGitOperation(cwd: string): string | undefined {
  const gitDirectory = git(cwd, ["rev-parse", "--absolute-git-dir"], true);
  if (!gitDirectory) return undefined;
  return ["MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD", "BISECT_LOG"].find(
    (path) => existsSync(resolve(gitDirectory, path)),
  );
}

async function activeGitOperationAsync(cwd: string): Promise<string | undefined> {
  const gitDirectory = await gitAsync(cwd, ["rev-parse", "--absolute-git-dir"], true);
  if (!gitDirectory) return undefined;
  return ["MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD", "BISECT_LOG"].find(
    (path) => existsSync(resolve(gitDirectory, path)),
  );
}

function inspectedLaneStatus(
  lane: Lane,
  state: LaneState,
  gitStatus: {
    head: string;
    branch?: string;
    changes: string;
    operation?: string;
    baseBranchDivergence?: GitDivergence;
    gitDiff?: LaneGitDiff;
  },
  runtimeHash = projectEnvironmentRuntimeHash(),
): LaneStatus {
  const { head, branch, changes, operation, baseBranchDivergence, gitDiff } = gitStatus;
  const baseBranchAhead = baseBranchDivergence?.ahead;
  const baseBranchBehind = baseBranchDivergence?.behind;
  const occupancyReason = laneOccupancyReason({
    operation,
    hasChanges: Boolean(changes),
    branch,
    baseBranch: lane.project.baseBranch,
    baseBranchAhead,
  });
  const availability: LaneAvailability = occupancyReason ? "occupied" : "available";
  const missingScript = requiredEnvironmentScripts.find(
    (script) => !existsSync(join(lane.path, "scripts/project-lanes", `${script}.ts`)),
  );
  if (missingScript) {
    return {
      lane,
      state,
      availability,
      health: "broken",
      branch,
      head,
      baseBranchAhead,
      baseBranchBehind,
      gitDiff,
      occupancyReason,
      healthReason: `missing project environment entrypoint: ${missingScript}.ts`,
    };
  }
  const healthError = laneHealthError(lane, state);
  if (healthError) {
    return {
      lane,
      state,
      availability,
      health: "broken",
      branch,
      head,
      baseBranchAhead,
      baseBranchBehind,
      gitDiff,
      occupancyReason,
      healthReason: `${summarizeLaneError(healthError)}${state.lastErrorAt ? ` (${state.lastErrorAt})` : ""}`,
    };
  }
  if (state.lastVerifiedRuntimeHash !== runtimeHash) {
    return {
      lane,
      state,
      availability,
      health: "drifted",
      branch,
      head,
      baseBranchAhead,
      baseBranchBehind,
      gitDiff,
      occupancyReason,
      healthReason: "shared environment runtime changed; run lanes repair",
    };
  }
  if (state.lastVerifiedProjectHash !== projectEnvironmentProjectHash(lane)) {
    return {
      lane,
      state,
      availability,
      health: "drifted",
      branch,
      head,
      baseBranchAhead,
      baseBranchBehind,
      gitDiff,
      occupancyReason,
      healthReason: "project environment contract changed; run lanes repair",
    };
  }
  if (!state.lastVerifiedAt || state.lastVerifiedHead !== head) {
    return {
      lane,
      state,
      availability,
      health: "drifted",
      branch,
      head,
      baseBranchAhead,
      baseBranchBehind,
      gitDiff,
      occupancyReason,
      healthReason: "environment verification required",
    };
  }

  return {
    lane,
    state,
    availability,
    health: "ready",
    branch,
    head,
    baseBranchAhead,
    baseBranchBehind,
    gitDiff,
    occupancyReason,
  };
}

function inspectLane(lane: Lane, state: LaneState): LaneStatus {
  if (!existsSync(lane.path)) {
    return {
      lane,
      state,
      availability: "available",
      health: "broken",
      healthReason: "clone missing",
    };
  }

  const head = git(lane.path, ["rev-parse", "HEAD"], true);
  const branch = git(lane.path, ["branch", "--show-current"], true) || undefined;
  const changes = git(lane.path, ["status", "--porcelain=v1", "--untracked-files=all"], true);
  const operation = activeGitOperation(lane.path);
  const baseBranchDivergence = parseGitDivergence(
    git(
      lane.path,
      ["rev-list", "--left-right", "--count", `HEAD...origin/${lane.project.baseBranch}`],
      true,
    ),
  );
  return inspectedLaneStatus(lane, state, {
    head,
    branch,
    changes,
    operation,
    baseBranchDivergence,
    gitDiff: inspectGitDiff(lane.path, changes),
  });
}

async function inspectLaneAsync(
  lane: Lane,
  state: LaneState,
  runtimeHash: string,
): Promise<LaneStatus> {
  if (!existsSync(lane.path)) {
    return {
      lane,
      state,
      availability: "available",
      health: "broken",
      healthReason: "clone missing",
    };
  }

  const [head, branchValue, changes, operation, divergenceValue] = await Promise.all([
    gitAsync(lane.path, ["rev-parse", "HEAD"], true),
    gitAsync(lane.path, ["branch", "--show-current"], true),
    gitAsync(lane.path, ["status", "--porcelain=v1", "--untracked-files=all"], true),
    activeGitOperationAsync(lane.path),
    gitAsync(
      lane.path,
      ["rev-list", "--left-right", "--count", `HEAD...origin/${lane.project.baseBranch}`],
      true,
    ),
  ]);
  const gitDiff = await inspectGitDiffAsync(lane.path, changes);
  return inspectedLaneStatus(
    lane,
    state,
    {
      head,
      branch: branchValue || undefined,
      changes,
      operation,
      baseBranchDivergence: parseGitDivergence(divergenceValue),
      gitDiff,
    },
    runtimeHash,
  );
}

async function runEnvironmentCommand(
  lane: Lane,
  script: "setup" | "mobile-development" | "verify" | "reset" | "destroy",
  extraArgs: string[] = [],
  compact = false,
  environment: Record<string, string> = {},
): Promise<void> {
  const scriptPath = join(lane.path, "scripts/project-lanes", `${script}.ts`);
  if (!existsSync(scriptPath)) throw new Error(`Missing project lane script: ${scriptPath}`);
  await execa("bun", [scriptPath, ...extraArgs], {
    cwd: lane.path,
    env: {
      ...process.env,
      PROJECT_LANE_ID: lane.id,
      PROJECT_LANE_NUMBER: String(lane.number),
      PROJECT_LANE_DEFINITION_ROOT: lane.path,
      PROJECT_LANES_RUNTIME_MODULE: pathToFileURL(projectEnvironmentRuntimePath).href,
      PROJECT_LANE_SIMSLIM_ENABLED: lane.project.simulatorSlimming ? "1" : "",
      PROJECT_LANE_SIMSLIM_EXCEPT_CATEGORIES:
        lane.project.simulatorSlimming?.exceptCategories.join(",") ?? "",
      PROJECT_LANE_SIMSLIM_KEEP_SERVICES:
        lane.project.simulatorSlimming?.keepServices?.join(",") ?? "",
      [lane.project.environmentVariable]: lane.path,
      ...environment,
    },
    stdio: compact ? "pipe" : "inherit",
  });
}

async function verifyLane(
  lane: Lane,
  state: LaneState,
  options: { mobile?: boolean; compact?: boolean; liveServices?: boolean } = {},
): Promise<void> {
  const { mobile = false, compact = false, liveServices = true } = options;
  await runEnvironmentCommand(lane, "verify", mobile ? ["--mobile-development"] : [], compact, {
    PROJECT_LANE_VERIFY_LIVE_SERVICES: liveServices ? "1" : "0",
  });
  if (mobile && lane.project.mobile) {
    verifyExpoDevelopmentClientFreshness({
      mobileDirectory: resolve(lane.path, lane.project.mobile.directory),
      simulatorName: `${lane.project.name} Lane ${lane.number}`,
      bundleIdentifier: lane.project.mobile.bundleIdentifier,
    });
  }
  state.lastVerifiedAt = new Date().toISOString();
  state.lastVerifiedHead = git(lane.path, ["rev-parse", "HEAD"]);
  state.lastVerifiedRuntimeHash = projectEnvironmentRuntimeHash();
  state.lastVerifiedProjectHash = projectEnvironmentProjectHash(lane);
  delete state.lastError;
  delete state.lastErrorAt;
}

export async function setupProjectLanes(
  projectId?: string,
  options: { mobile?: boolean; compact?: boolean } = {},
): Promise<void> {
  const { mobile = false, compact = false } = options;
  const projects = projectId ? [getActiveProject(projectId)] : getActiveProjects();
  const failures: string[] = [];
  await withRegistryLock(async (registry) => {
    for (const project of projects) {
      for (const lane of getProjectLanes(project)) {
        mkdirSync(dirname(lane.path), { recursive: true });
        const state = stateFor(registry, lane);
        try {
          await provisionLane(lane, state, { mobile, compact });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          state.lastError = message;
          state.lastErrorAt = new Date().toISOString();
          failures.push(`${project.id}/${lane.id}: ${message}`);
        }
      }
    }
  });
  if (failures.length > 0) {
    throw new Error(`Project lane setup failed:\n${failures.join("\n")}`);
  }
}

export async function addProjectLane(
  projectId: string,
  requestedNumber?: number,
  options: { mobile?: boolean; compact?: boolean; branch?: string } = {},
): Promise<Lane> {
  const { mobile = false, compact = false, branch } = options;
  if (branch) {
    const project = getActiveProject(projectId);
    assertLaneTaskBranch(project.baseBranch, branch);
    const existingRemoteBranch = git(process.cwd(), [
      "ls-remote",
      "--heads",
      project.remoteUrl,
      `refs/heads/${branch}`,
    ]);
    if (existingRemoteBranch) {
      throw new Error(`Remote branch already exists: ${branch}`);
    }
  }
  let addedLane: Lane | undefined;
  let failure: unknown;
  await withRegistryLock(async (registry) => {
    const currentConfig = readLanesConfig(LANES_CONFIG_PATH);
    const addition = addLaneDefinition(currentConfig, projectId, requestedNumber);
    if (existsSync(addition.lane.path)) {
      throw new Error(`Lane path already exists: ${addition.lane.path}`);
    }
    writeLanesConfig(LANES_CONFIG_PATH, addition.config);

    const project = getActiveProject(projectId);
    addedLane = getProjectLanes(project).find(({ number }) => number === addition.lane.number);
    if (!addedLane) throw new Error(`Could not register ${projectId}/lane-${addition.lane.number}`);
    const state = stateFor(registry, addedLane);
    try {
      await provisionLane(addedLane, state, { mobile, compact, branch });
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
      state.lastErrorAt = new Date().toISOString();
      failure = error;
    }
  });
  if (failure) throw failure;
  if (!addedLane) throw new Error(`Could not add a lane for ${projectId}`);
  return addedLane;
}

async function provisionLane(
  lane: Lane,
  state: LaneState,
  options: { mobile: boolean; compact: boolean; branch?: string },
): Promise<void> {
  const { mobile, compact, branch } = options;
  if (existsSync(lane.path)) {
    configureLaneGitSafety(lane);
    const current = inspectLane(lane, state);
    if (current.availability === "occupied" || (current.health === "ready" && !mobile)) return;
  } else {
    mkdirSync(dirname(lane.path), { recursive: true });
    git(dirname(lane.path), [
      "clone",
      "--no-local",
      "--branch",
      lane.project.baseBranch,
      lane.project.remoteUrl,
      lane.path,
    ]);
  }
  prepareLaneGit(lane, branch);
  await runEnvironmentCommand(lane, "setup", [], compact);
  if (mobile) await runEnvironmentCommand(lane, "mobile-development", [], compact);
  await verifyLane(lane, state, { mobile, compact });
}

export function releaseLaneGit(lane: Lane): void {
  configureLaneGitSafety(lane);
  const changes = git(lane.path, ["status", "--porcelain=v1", "--untracked-files=all"], true);
  const operation = activeGitOperation(lane.path);
  if (changes || operation) {
    throw new Error(
      `${lane.project.id}/${lane.id} has uncommitted or in-progress Git work; commit, stash, or clean it before making the lane available`,
    );
  }
  git(lane.path, ["fetch", "origin", lane.project.baseBranch]);
  git(lane.path, [
    "switch",
    "--force-create",
    lane.project.baseBranch,
    `origin/${lane.project.baseBranch}`,
  ]);
}

export function syncLaneGit(lane: Lane): void {
  configureLaneGitSafety(lane);
  const branch = git(lane.path, ["branch", "--show-current"], true);
  if (branch && branch !== lane.project.baseBranch) {
    throw new Error(
      `${lane.project.id}/${lane.id} must be on ${lane.project.baseBranch} or detached to sync`,
    );
  }
  git(lane.path, ["fetch", "origin", lane.project.baseBranch]);
  if (branch === lane.project.baseBranch) {
    git(lane.path, ["merge", "--ff-only", `origin/${lane.project.baseBranch}`]);
  } else {
    git(lane.path, ["switch", "--detach", `origin/${lane.project.baseBranch}`]);
  }
}

export async function syncProjectLane(projectId: string, laneId: string): Promise<void> {
  const project = getActiveProject(projectId);
  const lane = getProjectLanes(project).find(({ id }) => id === laneId);
  if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
  const state = stateFor(readRegistry(), lane);
  const status = inspectLane(lane, state);
  if (status.availability !== "available") {
    throw new Error(`${projectId}/${laneId} must be clean and available to sync`);
  }
  syncLaneGit(lane);
  const synced = inspectLane(lane, state);
  if (synced.availability !== "available" || synced.baseBranchBehind !== 0) {
    throw new Error(`${projectId}/${laneId} did not sync to origin/${project.baseBranch}`);
  }
}

function assertLaneReleasable(lane: Lane, state: LaneState): void {
  const status = inspectLane(lane, state);
  if (status.gitDiff || status.occupancyReason?.startsWith("Git ")) {
    throw new Error(
      `${lane.project.id}/${lane.id} has uncommitted or in-progress Git work; commit, stash, or clean it before making the lane available`,
    );
  }
}

export function assertProjectLaneReleasable(projectId: string, laneId: string): void {
  const project = getActiveProject(projectId);
  const lane = getProjectLanes(project).find(({ id }) => id === laneId);
  if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
  if (!existsSync(lane.path)) throw new Error(`Lane clone is missing: ${lane.path}`);
  assertLaneReleasable(lane, stateFor(readRegistry(), lane));
}

export async function releaseProjectLane(
  projectId: string,
  laneId: string,
  confirmed: boolean,
  options: { mobile?: boolean; compact?: boolean; beforeRelease?: () => Promise<void> } = {},
): Promise<void> {
  const { mobile = false, compact = false, beforeRelease } = options;
  if (!confirmed) throw new Error("Pass --confirm to discard lane work and make it available");
  let failure: unknown;
  await withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const lane = getProjectLanes(project).find(({ id }) => id === laneId);
    if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    if (!existsSync(lane.path)) throw new Error(`Lane clone is missing: ${lane.path}`);
    const state = stateFor(registry, lane);
    assertLaneReleasable(lane, state);
    await beforeRelease?.();
    try {
      releaseLaneGit(lane);
      await runEnvironmentCommand(lane, "setup", [], compact);
      await runEnvironmentCommand(lane, "reset", [], compact);
      if (mobile) await runEnvironmentCommand(lane, "mobile-development", [], compact);
      await verifyLane(lane, state, { mobile, compact, liveServices: false });
      const status = inspectLane(lane, state);
      if (status.availability !== "available" || status.health !== "ready") {
        throw new Error(
          `${projectId}/${laneId} was not released: ${status.occupancyReason || status.healthReason}`,
        );
      }
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
      state.lastErrorAt = new Date().toISOString();
      failure = error;
    }
  });
  if (failure) throw failure;
}

export async function listProjectLaneStatuses(projectId?: string): Promise<LaneStatus[]> {
  const registry = readRegistry();
  const projects = projectId ? [getActiveProject(projectId)] : getActiveProjects();
  const runtimeHash = projectEnvironmentRuntimeHash();
  return Promise.all(
    projects.flatMap((project) =>
      getProjectLanes(project).map((lane) =>
        inspectLaneAsync(lane, stateFor(registry, lane), runtimeHash),
      ),
    ),
  );
}

export async function verifyProjectLane(
  projectId?: string,
  laneId?: string,
  options: { cwd?: string; mobile?: boolean; compact?: boolean } = {},
): Promise<Lane> {
  const lane = selectProjectLane(getActiveProjects(), {
    projectId,
    laneId,
    cwd: options.cwd,
  });
  let failure: unknown;
  await withRegistryLock(async (registry) => {
    const state = stateFor(registry, lane);
    try {
      await verifyLane(lane, state, {
        mobile: options.mobile,
        compact: options.compact,
      });
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
      state.lastErrorAt = new Date().toISOString();
      failure = error;
    }
  });
  if (failure) throw failure;
  return lane;
}

export async function repairProjectLane(
  projectId?: string,
  laneId?: string,
  options: { cwd?: string; mobile?: boolean; compact?: boolean } = {},
): Promise<Lane> {
  const lane = selectProjectLane(getActiveProjects(), {
    projectId,
    laneId,
    cwd: options.cwd,
  });
  let failure: unknown;
  await withRegistryLock(async (registry) => {
    const state = stateFor(registry, lane);
    try {
      await runEnvironmentCommand(lane, "setup", [], options.compact);
      if (options.mobile) {
        await runEnvironmentCommand(lane, "mobile-development", [], options.compact);
      }
      await verifyLane(lane, state, options);
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
      state.lastErrorAt = new Date().toISOString();
      failure = error;
    }
  });
  if (failure) throw failure;
  return lane;
}

export async function auditProjectLanes(
  projectId?: string,
  options: { mobile?: boolean; compact?: boolean } = {},
): Promise<void> {
  const projects = projectId ? [getActiveProject(projectId)] : getActiveProjects();
  const failures: string[] = [];
  await withRegistryLock(async (registry) => {
    const lanes = projects.flatMap(getProjectLanes);
    await Promise.all(
      lanes.map(async (lane) => {
        const state = stateFor(registry, lane);
        try {
          await verifyLane(lane, state, options);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          state.lastError = message;
          state.lastErrorAt = new Date().toISOString();
          failures.push(`${lane.project.id}/${lane.id}: ${message}`);
        }
      }),
    );
  });
  for (const job of listProjectLaneCleanupJobs().filter(
    ({ project }) => !projectId || project.id === projectId,
  )) {
    failures.push(
      `${job.project.id}/${job.laneId}: cleanup ${job.phase}${job.lastError ? `: ${job.lastError}` : ""}`,
    );
  }
  if (failures.length > 0) {
    throw new Error(`Project lane audit failed:\n${failures.join("\n")}`);
  }
}

export async function resetProjectLane(
  projectId: string,
  laneId: string,
  options: { beforeReset?: () => Promise<void> } = {},
): Promise<void> {
  await withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const lane = getProjectLanes(project).find(({ id }) => id === laneId);
    if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    const state = stateFor(registry, lane);
    const operation = activeGitOperation(lane.path);
    if (operation) throw new Error(`${projectId}/${laneId} has Git ${operation} in progress`);
    await options.beforeReset?.();
    await runEnvironmentCommand(lane, "reset");
    await verifyLane(lane, state, { liveServices: false });
  });
}

export function assertProjectLaneDestroyable(projectId: string, laneId: string): void {
  const project = getActiveProject(projectId);
  const lane = getProjectLanes(project).find(({ id }) => id === laneId);
  if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
  const status = inspectLane(lane, stateFor(readRegistry(), lane));
  if (status.availability === "occupied") {
    throw new Error(`${projectId}/${laneId} is not safe to destroy: ${status.occupancyReason}`);
  }
}

export async function destroyProjectLane(
  projectId: string,
  laneId: string,
  confirmed: boolean,
  options: { beforeDestroy?: () => Promise<void> } = {},
): Promise<LaneCleanupJob> {
  if (!confirmed) throw new Error("Pass --confirm to destroy a persistent project lane");
  const project = getActiveProject(projectId);
  const lane = getProjectLanes(project).find(({ id }) => id === laneId);
  if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
  const status = inspectLane(lane, stateFor(readRegistry(), lane));
  if (status.availability === "occupied") {
    throw new Error(`${projectId}/${laneId} is not safe to destroy: ${status.occupancyReason}`);
  }

  await options.beforeDestroy?.();
  const timestamp = Date.now();
  const cleanupPath = join(
    dirname(lane.path),
    `.${basename(lane.path)}.lanes-cleanup-${timestamp}-${process.pid}`,
  );
  const job: LaneCleanupJob = {
    id: `${project.id}-${lane.id}-${timestamp}-${process.pid}`,
    project,
    laneId: lane.id,
    laneNumber: lane.number,
    originalPath: lane.path,
    cleanupPath,
    phase: "preparing",
    createdAt: new Date(timestamp).toISOString(),
    attempts: 0,
  };
  await withRegistryLockWhenAvailable(async (registry) => {
    const queue = readCleanupQueue();
    queue.jobs.push(job);
    writeCleanupQueue(queue);
    renameSync(lane.path, cleanupPath);
    delete registry.projects[project.id]?.[lane.id];
    writeLanesConfig(
      LANES_CONFIG_PATH,
      removeLaneDefinition(readLanesConfig(LANES_CONFIG_PATH), projectId, laneId),
    );
    job.phase = "ready";
    writeCleanupQueue(queue);
  });
  return job;
}
