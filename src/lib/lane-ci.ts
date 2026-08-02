import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

import { execa } from "execa";

import { getActiveProject, getProjectLanes, type Lane } from "./project-lanes";

export type LaneCiState =
  | "passing"
  | "running"
  | "failed"
  | "none"
  | "merged"
  | "closed"
  | "no-pr"
  | "unavailable";

export interface LaneCiStatus {
  project: string;
  lane: string;
  branch: string;
  state: LaneCiState;
  url?: string;
  number?: number;
  checks: number;
}

interface PullRequestCheck {
  status?: string;
  conclusion?: string;
  state?: string;
}

export interface PullRequest {
  headRefName: string;
  number: number;
  state: "OPEN" | "CLOSED" | "MERGED";
  mergedAt?: string | null;
  url: string;
  statusCheckRollup: PullRequestCheck[];
}

export async function laneCiStatuses(projectId: string): Promise<LaneCiStatus[]> {
  const project = getActiveProject(projectId);
  const lanes = getProjectLanes(project);
  const gh = ["/opt/homebrew/bin/gh", "/usr/local/bin/gh"].find(existsSync);
  if (!gh) return lanes.map((lane) => statusWithoutPullRequest(lane, "unavailable"));

  const result = await execa(
    gh,
    [
      "pr",
      "list",
      "--state",
      "all",
      "--repo",
      githubRepository(project.remoteUrl),
      "--limit",
      "200",
      "--json",
      "headRefName,number,state,mergedAt,url,statusCheckRollup",
    ],
    { reject: false },
  );
  if (result.exitCode !== 0) {
    return lanes.map((lane) => statusWithoutPullRequest(lane, "unavailable"));
  }

  const pullRequests = new Map<string, PullRequest>();
  for (const pullRequest of JSON.parse(result.stdout) as PullRequest[]) {
    if (!pullRequests.has(pullRequest.headRefName)) {
      pullRequests.set(pullRequest.headRefName, pullRequest);
    }
  }
  return lanes.map((lane) => {
    const branch = currentBranch(lane);
    const pullRequest = pullRequests.get(branch);
    if (!pullRequest) return statusWithoutPullRequest(lane, "no-pr", branch);
    return statusForPullRequest(projectId, lane.id, branch, pullRequest);
  });
}

export function statusForPullRequest(
  project: string,
  lane: string,
  branch: string,
  pullRequest: PullRequest,
): LaneCiStatus {
  const state =
    pullRequest.state === "MERGED" || pullRequest.mergedAt
      ? "merged"
      : pullRequest.state === "CLOSED"
        ? "closed"
        : summarizeChecks(pullRequest.statusCheckRollup);
  return {
    project,
    lane,
    branch,
    state,
    url: pullRequest.url,
    number: pullRequest.number,
    checks: pullRequest.statusCheckRollup.length,
  };
}

export function summarizeChecks(checks: PullRequestCheck[]): LaneCiState {
  if (checks.length === 0) return "none";
  const failedConclusions = new Set([
    "ACTION_REQUIRED",
    "CANCELLED",
    "FAILURE",
    "STALE",
    "STARTUP_FAILURE",
    "TIMED_OUT",
  ]);
  if (
    checks.some(
      ({ conclusion, state }) =>
        (conclusion && failedConclusions.has(conclusion)) ||
        state === "ERROR" ||
        state === "FAILURE",
    )
  ) {
    return "failed";
  }
  if (
    checks.some(({ status, conclusion, state }) =>
      state ? state !== "SUCCESS" : status !== "COMPLETED" || !conclusion,
    )
  ) {
    return "running";
  }
  return "passing";
}

function currentBranch(lane: Lane): string {
  return (
    execFileSync("git", ["branch", "--show-current"], {
      cwd: lane.path,
      encoding: "utf8",
    }).trim() || lane.project.baseBranch
  );
}

function statusWithoutPullRequest(
  lane: Lane,
  state: "no-pr" | "unavailable",
  branch = currentBranch(lane),
): LaneCiStatus {
  return { project: lane.project.id, lane: lane.id, branch, state, checks: 0 };
}

function githubRepository(remoteUrl: string): string {
  const url = new URL(remoteUrl);
  if (url.hostname !== "github.com") throw new Error(`Unsupported Git remote: ${remoteUrl}`);
  return url.pathname.replace(/^\//, "").replace(/\.git$/, "");
}
