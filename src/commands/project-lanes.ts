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
  await resetProjectLane(project, lane);
}

export async function projectLanesDestroy(
  project: string,
  lane: string,
  confirm = false,
): Promise<void> {
  await destroyProjectLane(project, lane, confirm);
}
