import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import {
  getProjectLanes,
  laneOccupancyReason,
  parseGitDivergence,
  releaseLaneGit,
  selectProjectLane,
  simulatorFleetFailures,
  syncLaneGit,
} from "./project-lanes";

const project = {
  id: "project",
  name: "Project",
  remoteUrl: "https://example.com/project.git",
  baseBranch: "main",
  lanePathPattern: "/projects/project-lane-{number}",
  lanes: [
    { number: 1, path: "/projects/project-lane-1" },
    { number: 2, path: "/projects/project-lane-2" },
  ],
  environmentVariable: "PROJECT_LANE_ROOT",
  services: [
    {
      id: "frontend",
      name: "Frontend",
      directory: "app",
      runner: { type: "bun-script" as const, script: "dev" },
    },
  ],
};

test("uses each configured lane path directly", () => {
  const configuredLanes = [
    { number: 3, path: "/projects/custom-three" },
    { number: 1, path: "/projects/custom-one" },
  ];
  const lanes = getProjectLanes({
    id: "project",
    name: "Project",
    remoteUrl: "https://example.com/project.git",
    baseBranch: "main",
    lanePathPattern: "/projects/project-lane-{number}",
    lanes: configuredLanes,
    environmentVariable: "PROJECT_LANE_ROOT",
    services: project.services,
  });

  expect(lanes.map(({ id }) => id)).toEqual(["lane-3", "lane-1"]);
  expect(lanes.map(({ number }) => number)).toEqual([3, 1]);
  expect(lanes.map(({ path }) => path)).toEqual(configuredLanes.map(({ path }) => path));
});

test("selects the current lane without expanding verification to the fleet", () => {
  const lane = selectProjectLane([project], { cwd: "/projects/project-lane-2/app" });

  expect(lane.id).toBe("lane-2");
});

test("requires an explicit lane outside a configured lane directory", () => {
  expect(() =>
    selectProjectLane([project], { projectId: "project", cwd: "/projects/tools" }),
  ).toThrow("pass an explicit lane id or use lanes audit project");

  expect(
    selectProjectLane([project], {
      projectId: "project",
      laneId: "lane-1",
      cwd: "/projects/tools",
    }).id,
  ).toBe("lane-1");
});

test("reports every simulator error and profile mismatch", () => {
  const failures = simulatorFleetFailures({
    operation: "apply",
    simulators: [
      {
        project: "project",
        lane: "lane-1",
        simulatorName: "Project Lane 1",
        mode: "project",
        matchesProfile: true,
      },
      {
        project: "project",
        lane: "lane-2",
        simulatorName: "Project Lane 2",
        mode: "project",
        matchesProfile: false,
      },
      {
        project: "project",
        lane: "lane-3",
        simulatorName: "Project Lane 3",
        mode: "project",
        error: "missing",
      },
    ],
  });

  expect(failures.map(({ lane }) => lane)).toEqual(["lane-2", "lane-3"]);
});

test("classifies clean base branches without local commits as available", () => {
  expect(
    laneOccupancyReason({
      hasChanges: false,
      branch: "main",
      baseBranch: "main",
      baseBranchAhead: 0,
    }),
  ).toBeUndefined();
  expect(
    laneOccupancyReason({
      hasChanges: false,
      baseBranch: "main",
      baseBranchAhead: 0,
    }),
  ).toBeUndefined();
});

test("keeps Git work occupied", () => {
  expect(
    laneOccupancyReason({
      hasChanges: false,
      branch: "main",
      baseBranch: "main",
      baseBranchAhead: 1,
    }),
  ).toBe("1 local commit outside origin/main");
  expect(
    laneOccupancyReason({
      hasChanges: false,
      branch: "task/example",
      baseBranch: "main",
    }),
  ).toBe("task branch checked out");
  expect(
    laneOccupancyReason({
      hasChanges: true,
      branch: "main",
      baseBranch: "main",
      baseBranchAhead: 0,
    }),
  ).toBe("Git changes present");
});

test("parses base branch divergence", () => {
  expect(parseGitDivergence("0\t2")).toEqual({ ahead: 0, behind: 2 });
  expect(parseGitDivergence("unavailable")).toBeUndefined();
});

test("releases Git work at the latest remote base commit", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-release-"));
  const remote = join(root, "remote.git");
  const source = join(root, "source");
  const lanePath = join(root, "lane");
  const runGit = (cwd: string, args: string[]) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

  try {
    execFileSync("git", ["init", "--bare", remote]);
    execFileSync("git", ["clone", remote, source]);
    runGit(source, ["config", "user.name", "Lanes Test"]);
    runGit(source, ["config", "user.email", "lanes@example.test"]);
    writeFileSync(join(source, "tracked.txt"), "first\n");
    runGit(source, ["add", "tracked.txt"]);
    runGit(source, ["commit", "-m", "first"]);
    runGit(source, ["branch", "-M", "main"]);
    runGit(source, ["push", "-u", "origin", "main"]);
    execFileSync("git", ["clone", "--branch", "main", remote, lanePath]);
    runGit(lanePath, ["switch", "-c", "task"]);
    writeFileSync(join(lanePath, "tracked.txt"), "task work\n");
    writeFileSync(join(lanePath, "untracked.txt"), "discard me\n");

    writeFileSync(join(source, "tracked.txt"), "latest\n");
    runGit(source, ["commit", "-am", "latest"]);
    runGit(source, ["push"]);

    releaseLaneGit({
      id: "lane-1",
      number: 1,
      path: lanePath,
      project: { ...project, lanes: [{ number: 1, path: lanePath }], remoteUrl: remote },
    });

    expect(runGit(lanePath, ["branch", "--show-current"])).toBe("");
    expect(runGit(lanePath, ["rev-parse", "HEAD"])).toBe(
      runGit(lanePath, ["rev-parse", "origin/main"]),
    );
    expect(runGit(lanePath, ["status", "--porcelain=v1", "--untracked-files=all"])).toBe("");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fast-forwards a clean lane to the latest remote base commit", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-sync-"));
  const remote = join(root, "remote.git");
  const source = join(root, "source");
  const lanePath = join(root, "lane");
  const runGit = (cwd: string, args: string[]) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

  try {
    execFileSync("git", ["init", "--bare", remote]);
    execFileSync("git", ["clone", remote, source]);
    runGit(source, ["config", "user.name", "Lanes Test"]);
    runGit(source, ["config", "user.email", "lanes@example.test"]);
    writeFileSync(join(source, "tracked.txt"), "first\n");
    runGit(source, ["add", "tracked.txt"]);
    runGit(source, ["commit", "-m", "first"]);
    runGit(source, ["branch", "-M", "main"]);
    runGit(source, ["push", "-u", "origin", "main"]);
    execFileSync("git", ["clone", "--branch", "main", remote, lanePath]);

    writeFileSync(join(source, "tracked.txt"), "latest\n");
    runGit(source, ["commit", "-am", "latest"]);
    runGit(source, ["push"]);

    syncLaneGit({
      id: "lane-1",
      number: 1,
      path: lanePath,
      project: { ...project, lanes: [{ number: 1, path: lanePath }], remoteUrl: remote },
    });

    expect(runGit(lanePath, ["branch", "--show-current"])).toBe("main");
    expect(runGit(lanePath, ["rev-parse", "HEAD"])).toBe(
      runGit(lanePath, ["rev-parse", "origin/main"]),
    );
    expect(runGit(lanePath, ["status", "--porcelain=v1", "--untracked-files=all"])).toBe("");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
