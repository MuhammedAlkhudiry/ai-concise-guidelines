import {
  acquireProjectLane,
  destroyProjectLane,
  listProjectLaneStatuses,
  PROJECT_LANES_STATE_PATH,
  releaseProjectLane,
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
    console.log(JSON.stringify({ statePath: PROJECT_LANES_STATE_PATH, lanes: statuses }, null, 2));
    return;
  }
  for (const { lane, status, branch, reason, state } of statuses) {
    const detail = state.lease
      ? `${state.lease.branch} — ${state.lease.task}`
      : branch || reason || "verified";
    console.log(`${lane.project.id}/${lane.id}\t${status.toUpperCase()}\t${detail}`);
  }
}

export async function projectLanesAcquire(
  project: string,
  branch: string,
  task: string,
  owner?: string,
): Promise<void> {
  const status = await acquireProjectLane(
    project,
    branch,
    task,
    owner || process.env.CODEX_THREAD_ID || process.env.USER || "unknown",
  );
  console.log(status.lane.path);
}

export async function projectLanesRelease(project: string, lane: string): Promise<void> {
  await releaseProjectLane(project, lane);
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
