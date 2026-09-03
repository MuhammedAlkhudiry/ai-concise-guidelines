import { execa } from "execa";

import type { Lane } from "../lib/project-lanes";

import {
  applyLaneSimulatorSlimming,
  auditProjectLanes,
  destroyProjectLane,
  getActiveProject,
  getProjectLanes,
  LANES_STATE_PATH,
  listProjectLaneStatuses,
  provisionProjectLane,
  repairProjectLane,
  resetProjectLane,
  restoreLaneSimulators,
  simulatorFleetFailures,
  statusLaneSimulators,
  verifyProjectLane,
  type SimulatorFleetReport,
  type SimulatorSlimmingMode,
  pruneMissingProjectLanes,
} from "../lib/project-lanes";
import {
  laneServiceLogPath,
  listLaneServiceStatuses,
  openLaneTarget,
  readLaneServiceLogs,
  reloadLaneService,
  restartLaneService,
  startLaneService,
  stopLaneService,
  stopLaneServices,
  type LaneServicesStatus,
  verifyLaneServiceDefinitions,
} from "../lib/lane-services";

function printSimulatorFleetReport(report: SimulatorFleetReport, json: boolean): void {
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    for (const simulator of report.simulators) {
      const status = simulator.error
        ? `ERROR\t${simulator.error}`
        : simulator.matchesProfile
          ? `MATCH\t${simulator.actualDisabled}/${simulator.expectedDisabled} disabled`
          : `MISMATCH\t${simulator.actualDisabled}/${simulator.expectedDisabled} disabled`;
      console.log(`${simulator.project}/${simulator.lane}\t${status}`);
    }
  }
  const failures = simulatorFleetFailures(report);
  if (failures.length > 0) {
    throw new Error(
      `${report.operation} failed for ${failures.map(({ project, lane }) => `${project}/${lane}`).join(", ")}`,
    );
  }
}

function slimmingMode(value: string | undefined): SimulatorSlimmingMode {
  if (value === undefined || value === "project") return "project";
  if (value === "full") return "full";
  throw new Error(`Unknown simulator slimming mode: ${value}`);
}

export async function projectLanesProvision(
  project: string,
  lane: string,
  root?: string,
  mobile = false,
  compact = false,
): Promise<void> {
  const provisioned = await provisionProjectLane(project, lane, { root, mobile, compact });
  verifyLaneServiceDefinitions(project, lane);
  console.log(`${project}/${lane}\tPROVISIONED\t${provisioned.path}\tslot=${provisioned.number}`);
}

function reportPrunedLanes(pruned: Lane[], json: boolean): void {
  if (json) return;
  for (const lane of pruned) {
    console.log(`${lane.project.id}/${lane.id}\tPRUNED\ttask; slot ${lane.number}; ${lane.path}; root missing`);
  }
}

export async function projectLanesPrune(project?: string): Promise<void> {
  const pruned = await pruneMissingProjectLanes(project);
  reportPrunedLanes(pruned, false);
  if (pruned.length === 0) console.log("No task environments with a missing root");
}

export async function projectLanesStatus(
  project?: string,
  json = false,
  verbose = false,
): Promise<void> {
  reportPrunedLanes(await pruneMissingProjectLanes(project), json);
  const statuses = await listProjectLaneStatuses(project);
  if (json) {
    process.stdout.write(
      `${JSON.stringify({ statePath: LANES_STATE_PATH, lanes: statuses }, null, 2)}\n`,
    );
    return;
  }
  for (const { lane, state, health, healthReason } of statuses) {
    const detail = [lane.kind, `slot ${lane.number}`, lane.path, healthReason]
      .filter(Boolean)
      .join("; ");
    console.log(`${lane.project.id}/${lane.id}\t${health.toUpperCase()}\t${detail}`);
    if (verbose && state.lastError) console.log(state.lastError);
  }
}

export async function projectLanesVerify(
  project?: string,
  lane?: string,
  mobile = false,
  compact = false,
): Promise<void> {
  const verified = await verifyProjectLane(project, lane, { mobile, compact });
  verifyLaneServiceDefinitions(verified.project.id, verified.id);
  console.log(`${verified.project.id}/${verified.id}\tVERIFIED`);
}

export async function projectLanesRepair(
  project?: string,
  lane?: string,
  mobile = false,
  compact = false,
): Promise<void> {
  const repaired = await repairProjectLane(project, lane, { mobile, compact });
  verifyLaneServiceDefinitions(repaired.project.id, repaired.id);
  console.log(`${repaired.project.id}/${repaired.id}\tREPAIRED\tREADY`);
}

export async function projectLanesAudit(
  project?: string,
  mobile = false,
  compact = false,
): Promise<void> {
  reportPrunedLanes(await pruneMissingProjectLanes(project), false);
  await auditProjectLanes(project, { mobile, compact });
  console.log(`lanes audit${project ? ` ${project}` : ""}: ok`);
}

export async function projectLaneSimulatorsStatus(
  project?: string,
  mode: SimulatorSlimmingMode = "project",
  json = false,
): Promise<void> {
  printSimulatorFleetReport(await statusLaneSimulators(project, slimmingMode(mode)), json);
}

export async function projectLaneSimulatorsApply(
  project?: string,
  mode: SimulatorSlimmingMode = "project",
  json = false,
): Promise<void> {
  printSimulatorFleetReport(await applyLaneSimulatorSlimming(project, slimmingMode(mode)), json);
}

export async function projectLaneSimulatorsRestore(project?: string, json = false): Promise<void> {
  printSimulatorFleetReport(await restoreLaneSimulators(project), json);
}

export async function projectLanesReset(project: string, lane: string): Promise<void> {
  await resetProjectLane(project, lane, {
    beforeReset: () => stopLaneServices(project, lane, "all"),
  });
  console.log(`${project}/${lane}\tRESET\tdata reset; project files preserved`);
}

export async function projectLanesDestroy(
  project: string,
  lane: string,
  confirm = false,
): Promise<void> {
  const destroyed = await destroyProjectLane(project, lane, confirm, {
    beforeDestroy: () => stopLaneServices(project, lane, "all"),
  });
  console.log(
    `${project}/${lane}\tDESTROYED\tresources removed; root preserved at ${destroyed.path}`,
  );
}

function printServiceStatuses(statuses: LaneServicesStatus[], json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ lanes: statuses }, null, 2));
    return;
  }
  for (const lane of statuses) {
    for (const service of lane.services) {
      const ownership = service.manageable ? (service.managed ? "managed" : "external") : "health";
      console.log(
        `${lane.project}/${lane.lane}\t${service.name}\t${service.state.toUpperCase()}\t${ownership}`,
      );
    }
  }
}

export async function projectLaneServices(
  operation: string,
  project?: string,
  lane?: string,
  service?: string,
  options: {
    json?: boolean;
    lines?: string;
    follow?: boolean;
    raw?: boolean;
    siteTimeout?: string;
  } = {},
): Promise<void> {
  if (operation === "status") {
    const siteTimeout = Number(options.siteTimeout ?? "3000");
    if (!Number.isSafeInteger(siteTimeout) || siteTimeout < 1) {
      throw new Error("--site-timeout must be a positive integer");
    }
    printServiceStatuses(
      await listLaneServiceStatuses(project, lane, { siteTimeout }),
      Boolean(options.json),
    );
    return;
  }
  if (!project || !lane || !service) {
    throw new Error(`lanes services ${operation} requires project, environment, and service`);
  }
  if (operation === "start" || operation === "stop" || operation === "restart") {
    const laneIDs =
      lane === "all" ? getProjectLanes(getActiveProject(project)).map(({ id }) => id) : [lane];
    const statuses = await Promise.all(
      laneIDs.map((laneID) =>
        operation === "start"
          ? startLaneService(project, laneID, service)
          : operation === "stop"
            ? stopLaneService(project, laneID, service)
            : restartLaneService(project, laneID, service),
      ),
    );
    printServiceStatuses(statuses, Boolean(options.json));
    return;
  }
  if (operation === "logs") {
    const lines = Number(options.lines ?? "30");
    if (!Number.isSafeInteger(lines) || lines < 1) throw new Error("--lines must be positive");
    if (options.follow) {
      if (options.json) throw new Error("--follow and --json cannot be combined");
      await execa("tail", ["-n", String(lines), "-f", laneServiceLogPath(project, lane, service)], {
        stdio: "inherit",
      });
      return;
    }
    const output = readLaneServiceLogs(project, lane, service, lines, Boolean(options.raw));
    console.log(
      options.json ? JSON.stringify({ project, lane, service, output }, null, 2) : output,
    );
    return;
  }
  throw new Error(`Unknown services operation: ${operation}`);
}

export async function projectLaneReload(
  project: string,
  lane: string,
  json = false,
): Promise<void> {
  const result = await reloadLaneService(project, lane, "metro");
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `${result.project}/${result.lane}\tRELOAD SENT\t${result.connectedClients} native connections${result.restarted ? "; Metro restarted" : ""}`,
    );
  }
}

export async function projectLaneOpen(
  project: string,
  lane: string,
  target: string,
): Promise<void> {
  if (
    target !== "phpstorm" &&
    target !== "finder" &&
    target !== "simulator" &&
    target !== "browser"
  ) {
    throw new Error(`Unknown environment target: ${target}`);
  }
  await openLaneTarget(project, lane, target);
}
