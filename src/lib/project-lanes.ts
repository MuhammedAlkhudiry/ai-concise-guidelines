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
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { execa } from "execa";
import { z } from "zod";

import { readLanesConfig, type ActiveProject } from "./lanes-config";
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
import type { SimulatorSlimmingProfile } from "./project-environment/types";

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
  occupancyReason?: string;
  healthReason?: string;
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
      await execa("xcrun", ["simctl", "boot", simulator.udid!], { env: process.env });
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
      await execa("xcrun", ["simctl", "shutdown", simulator.udid!], { env: process.env });
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

  const availability: LaneAvailability = operation || changes || branch ? "occupied" : "available";
  const occupancyReason = operation
    ? `Git ${operation} in progress`
    : changes
      ? "Git changes present"
      : branch
        ? "task branch checked out"
        : undefined;
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
      occupancyReason,
      healthReason: `missing project environment entrypoint: ${missingScript}.ts`,
    };
  }
  if (state.lastError) {
    return {
      lane,
      state,
      availability,
      health: "broken",
      branch,
      head,
      occupancyReason,
      healthReason: state.lastError,
    };
  }
  if (state.lastVerifiedRuntimeHash !== projectEnvironmentRuntimeHash()) {
    return {
      lane,
      state,
      availability,
      health: "drifted",
      branch,
      head,
      occupancyReason,
      healthReason: "shared project environment runtime changed",
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
      occupancyReason,
      healthReason: "environment verification required",
    };
  }

  return { lane, state, availability, health: "ready", branch, head, occupancyReason };
}

async function runEnvironmentCommand(
  lane: Lane,
  script: "setup" | "mobile-development" | "verify" | "reset" | "destroy",
  extraArgs: string[] = [],
  compact = false,
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
    },
    stdio: compact ? "pipe" : "inherit",
  });
}

async function verifyLane(
  lane: Lane,
  state: LaneState,
  options: { mobile?: boolean; compact?: boolean } = {},
): Promise<void> {
  const { mobile = true, compact = false } = options;
  await runEnvironmentCommand(lane, "verify", mobile ? ["--mobile-development"] : [], compact);
  state.lastVerifiedAt = new Date().toISOString();
  state.lastVerifiedHead = git(lane.path, ["rev-parse", "HEAD"]);
  state.lastVerifiedRuntimeHash = projectEnvironmentRuntimeHash();
  delete state.lastError;
}

export async function setupProjectLanes(projectId?: string, compact = false): Promise<void> {
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
            if (current.availability === "occupied") {
              throw new Error(`${project.id}/${lane.id} is not safe to reprovision`);
            }
          }
          git(lane.path, ["fetch", "origin", project.baseBranch]);
          git(lane.path, ["switch", "--detach", `origin/${project.baseBranch}`]);
          await runEnvironmentCommand(lane, "setup", [], compact);
          await runEnvironmentCommand(lane, "mobile-development", [], compact);
          await verifyLane(lane, state, { compact });
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

export async function verifyProjectLane(
  projectId?: string,
  laneId?: string,
  options: { cwd?: string; compact?: boolean } = {},
): Promise<Lane> {
  const lane = selectProjectLane(getActiveProjects(), { projectId, laneId, cwd: options.cwd });
  let failure: unknown;
  await withRegistryLock(async (registry) => {
    const state = stateFor(registry, lane);
    try {
      await verifyLane(lane, state, { compact: options.compact });
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
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
    for (const project of projects) {
      for (const lane of getProjectLanes(project)) {
        const state = stateFor(registry, lane);
        try {
          await verifyLane(lane, state, options);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          state.lastError = message;
          failures.push(`${project.id}/${lane.id}: ${message}`);
        }
      }
    }
  });
  if (failures.length > 0) {
    throw new Error(`Project lane audit failed:\n${failures.join("\n")}`);
  }
}

export async function resetProjectLane(projectId: string, laneId: string): Promise<void> {
  await withRegistryLock(async (registry) => {
    const project = getActiveProject(projectId);
    const lane = getProjectLanes(project).find(({ id }) => id === laneId);
    if (!lane) throw new Error(`Unknown lane: ${projectId}/${laneId}`);
    const state = stateFor(registry, lane);
    const status = inspectLane(lane, state);
    if (status.availability === "occupied") {
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
    if (status.availability === "occupied" || status.health === "broken") {
      throw new Error(
        `${projectId}/${laneId} is not safe to destroy: ${status.occupancyReason || status.healthReason}`,
      );
    }
    await runEnvironmentCommand(lane, "destroy");
    rmSync(lane.path, { recursive: true });
    delete registry.projects[project.id]?.[lane.id];
  });
}
