import {
  auditProjectLanes,
  applyLaneSimulatorSlimming,
  destroyProjectLane,
  LANES_STATE_PATH,
  listProjectLaneStatuses,
  resetProjectLane,
  restoreLaneSimulators,
  setupProjectLanes,
  simulatorFleetFailures,
  statusLaneSimulators,
  verifyProjectLane,
  type SimulatorFleetReport,
  type SimulatorSlimmingMode,
} from "../lib/project-lanes";
import {
  laneServiceLogPath,
  listLaneServiceStatuses,
  openLaneTarget,
  readLaneServiceLogs,
  restartLaneService,
  startLaneService,
  stopLaneService,
  type LaneServicesStatus,
  verifyLaneServiceDefinitions,
} from "../lib/lane-services";
import { execa } from "execa";

function printSimulatorFleetReport(report: SimulatorFleetReport, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
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

export async function projectLanesSetup(project?: string, compact = false): Promise<void> {
  await setupProjectLanes(project, compact);
  verifyLaneServiceDefinitions(project);
  if (compact) console.log(`lanes setup${project ? ` ${project}` : ""}: ok`);
}

export function projectLanesStatus(project?: string, json = false): void {
  const statuses = listProjectLaneStatuses(project);
  if (json) {
    console.log(JSON.stringify({ statePath: LANES_STATE_PATH, lanes: statuses }, null, 2));
    return;
  }
  for (const { lane, availability, health, branch, occupancyReason, healthReason } of statuses) {
    const detail = [branch, occupancyReason, healthReason].filter(Boolean).join("; ") || "verified";
    console.log(
      `${lane.project.id}/${lane.id}\t${availability.toUpperCase()}\t${health.toUpperCase()}\t${detail}`,
    );
  }
}

export async function projectLanesVerify(
  project?: string,
  lane?: string,
  compact = false,
): Promise<void> {
  const verified = await verifyProjectLane(project, lane, { compact });
  verifyLaneServiceDefinitions(verified.project.id, verified.id);
  console.log(`${verified.project.id}/${verified.id}\tVERIFIED`);
}

export async function projectLanesAudit(
  project?: string,
  mobile = false,
  compact = false,
): Promise<void> {
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
  await stopLaneService(project, lane, "all");
  await resetProjectLane(project, lane);
}

export async function projectLanesDestroy(
  project: string,
  lane: string,
  confirm = false,
): Promise<void> {
  await stopLaneService(project, lane, "all");
  await destroyProjectLane(project, lane, confirm);
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
  options: { json?: boolean; lines?: string; follow?: boolean; raw?: boolean } = {},
): Promise<void> {
  if (operation === "status") {
    printServiceStatuses(await listLaneServiceStatuses(project, lane), Boolean(options.json));
    return;
  }
  if (!project || !lane || !service) {
    throw new Error(`lanes services ${operation} requires project, lane, and service`);
  }
  if (operation === "start" || operation === "stop" || operation === "restart") {
    const status =
      operation === "start"
        ? await startLaneService(project, lane, service)
        : operation === "stop"
          ? await stopLaneService(project, lane, service)
          : await restartLaneService(project, lane, service);
    printServiceStatuses([status], Boolean(options.json));
    return;
  }
  if (operation === "logs") {
    const lines = Number(options.lines ?? "30");
    if (!Number.isSafeInteger(lines) || lines < 1) throw new Error("--lines must be positive");
    if (options.follow) {
      if (options.json) throw new Error("--follow and --json cannot be combined");
      const path = laneServiceLogPath(project, lane, service);
      await execa("tail", ["-n", String(lines), "-f", path], { stdio: "inherit" });
      return;
    }
    const output = readLaneServiceLogs(project, lane, service, lines);
    console.log(
      options.json ? JSON.stringify({ project, lane, service, output }, null, 2) : output,
    );
    return;
  }
  throw new Error(`Unknown services operation: ${operation}`);
}

export async function projectLaneOpen(
  project: string,
  lane: string,
  target: string,
): Promise<void> {
  if (target !== "phpstorm" && target !== "simulator" && target !== "browser") {
    throw new Error(`Unknown lane target: ${target}`);
  }
  await openLaneTarget(project, lane, target);
}
