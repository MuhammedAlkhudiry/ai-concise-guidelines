import {
  destroyProjectLane,
  LANES_STATE_PATH,
  listProjectLaneStatuses,
  resetProjectLane,
  setupProjectLanes,
  verifyProjectLanes,
} from "../lib/project-lanes";

export async function projectLanesSetup(project?: string): Promise<void> {
  await setupProjectLanes(project);
}

export function projectLanesStatus(project?: string, json = false): void {
  const statuses = listProjectLaneStatuses(project);
  if (json) {
    console.log(JSON.stringify({ statePath: LANES_STATE_PATH, lanes: statuses }, null, 2));
    return;
  }
  for (const { lane, status, branch, reason } of statuses) {
    const detail = branch || reason || "verified";
    console.log(`${lane.project.id}/${lane.id}\t${status.toUpperCase()}\t${detail}`);
  }
}

export async function projectLanesVerify(project?: string): Promise<void> {
  await verifyProjectLanes(project);
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
