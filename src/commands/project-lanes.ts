import {
  addProjectLane,
  auditProjectLanes,
  applyLaneSimulatorSlimming,
  destroyProjectLane,
  LANES_STATE_PATH,
  listProjectLaneStatuses,
  releaseProjectLane,
  resetProjectLane,
  restoreLaneSimulators,
  setupProjectLanes,
  simulatorFleetFailures,
  statusLaneSimulators,
  syncProjectLane,
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
import { laneCiStatuses } from "../lib/lane-ci";
import { createLanePullRequest } from "../lib/lane-pull-request";
import type { PullRequestCreationStage } from "../lib/lane-pull-request";
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

export async function projectLanesSetup(
  project?: string,
  mobile = false,
  compact = false,
): Promise<void> {
  await setupProjectLanes(project, { mobile, compact });
  verifyLaneServiceDefinitions(project);
  if (compact) console.log(`lanes setup${project ? ` ${project}` : ""}: ok`);
}

export async function projectLanesAdd(
  project: string,
  numberValue?: string,
  mobile = false,
  compact = false,
): Promise<void> {
  const number = numberValue === undefined ? undefined : Number(numberValue);
  if (number !== undefined && (!Number.isSafeInteger(number) || number < 1)) {
    throw new Error("Lane number must be positive");
  }
  const lane = await addProjectLane(project, number, { mobile, compact });
  verifyLaneServiceDefinitions(project, lane.id);
  console.log(`${project}/${lane.id}\tADDED\t${lane.path}`);
}

export function projectLanesStatus(project?: string, json = false): void {
  const statuses = listProjectLaneStatuses(project);
  if (json) {
    process.stdout.write(
      `${JSON.stringify({ statePath: LANES_STATE_PATH, lanes: statuses }, null, 2)}\n`,
    );
    return;
  }
  for (const {
    lane,
    availability,
    health,
    branch,
    baseBranchBehind,
    occupancyReason,
    healthReason,
  } of statuses) {
    const baseStatus =
      availability === "available" && baseBranchBehind !== undefined
        ? baseBranchBehind === 0
          ? "latest"
          : `${baseBranchBehind} behind`
        : undefined;
    const detail =
      [branch, baseStatus, occupancyReason, healthReason].filter(Boolean).join("; ") || "verified";
    console.log(
      `${lane.project.id}/${lane.id}\t${availability.toUpperCase()}\t${health.toUpperCase()}\t${detail}`,
    );
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

export async function projectLanesSync(project: string, lane: string): Promise<void> {
  await syncProjectLane(project, lane);
  console.log(`${project}/${lane}\tSYNCED\tLATEST`);
}

export async function projectLanesRelease(
  project: string,
  lane: string,
  confirm = false,
  mobile = false,
  compact = false,
): Promise<void> {
  if (!confirm) throw new Error("Pass --confirm to discard lane work and make it available");
  await stopLaneService(project, lane, "all");
  await releaseProjectLane(project, lane, confirm, { mobile, compact });
  console.log(`${project}/${lane}\tAVAILABLE\tREADY`);
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
  options: {
    json?: boolean;
    lines?: string;
    follow?: boolean;
    raw?: boolean;
  } = {},
): Promise<void> {
  if (operation === "status") {
    printServiceStatuses(await listLaneServiceStatuses(project, lane), Boolean(options.json));
    return;
  }
  if (!project || !lane || !service) {
    throw new Error(`lanes services ${operation} requires project, lane, and service`);
  }
  if (operation === "start" || operation === "stop" || operation === "restart") {
    const laneIDs =
      lane === "all"
        ? (await listLaneServiceStatuses(project)).map(({ lane: laneID }) => laneID)
        : [lane];
    const statuses: LaneServicesStatus[] = [];
    for (const laneID of laneIDs) {
      statuses.push(
        operation === "start"
          ? await startLaneService(project, laneID, service)
          : operation === "stop"
            ? await stopLaneService(project, laneID, service)
            : await restartLaneService(project, laneID, service),
      );
    }
    printServiceStatuses(statuses, Boolean(options.json));
    return;
  }
  if (operation === "logs") {
    const lines = Number(options.lines ?? "30");
    if (!Number.isSafeInteger(lines) || lines < 1) throw new Error("--lines must be positive");
    if (options.follow) {
      if (options.json) throw new Error("--follow and --json cannot be combined");
      const path = laneServiceLogPath(project, lane, service);
      await execa("tail", ["-n", String(lines), "-f", path], {
        stdio: "inherit",
      });
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

export async function projectLaneCi(
  operation: string,
  project: string,
  lane?: string,
  json = false,
): Promise<void> {
  if (operation !== "status") throw new Error(`Unknown CI operation: ${operation}`);
  const statuses = (await laneCiStatuses(project)).filter(
    (status) => !lane || lane === "all" || status.lane === lane,
  );
  if (lane && lane !== "all" && statuses.length === 0) {
    throw new Error(`Unknown lane: ${project}/${lane}`);
  }
  if (json) {
    console.log(JSON.stringify({ lanes: statuses }, null, 2));
    return;
  }
  for (const status of statuses) {
    console.log(
      `${status.project}/${status.lane}\t${status.state.toUpperCase()}\t${status.branch}`,
    );
  }
}

export async function projectLanePullRequest(
  operation: string,
  project: string,
  lane: string,
  json = false,
): Promise<void> {
  if (operation !== "create") throw new Error(`Unknown pull-request operation: ${operation}`);
  const reportProgress = (stage: PullRequestCreationStage): void => {
    console.log(json ? JSON.stringify({ type: "progress", stage }) : `PR\t${stage.toUpperCase()}`);
  };
  const pullRequest = await createLanePullRequest(project, lane, reportProgress);
  console.log(
    json
      ? JSON.stringify({ type: "complete", ...pullRequest })
      : `${pullRequest.project}/${pullRequest.lane}\tCREATED\t${pullRequest.url}`,
  );
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
    target !== "browser" &&
    target !== "branch" &&
    target !== "github-branch"
  ) {
    throw new Error(`Unknown lane target: ${target}`);
  }
  await openLaneTarget(project, lane, target);
}
