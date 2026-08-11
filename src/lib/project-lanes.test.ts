import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "bun:test";

import {
  assertLaneTaskBranch,
  getProjectLanes,
  laneOccupancyReason,
  parseGitDivergence,
  prepareLaneGit,
  releaseLaneGit,
  selectProjectLane,
  simulatorFleetFailures,
  summarizeLaneError,
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

test("reduces stored environment failures to one actionable line", () => {
  expect(
    summarizeLaneError(
      "Command failed with exit code 1: bun verify.ts\nerror: Typesense health failed with HTTP 401\nlong output",
    ),
  ).toBe("Typesense health failed with HTTP 401");
});

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

test("creates a task branch from remote main without allowing a default push to move main", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-task-branch-"));
  const remote = join(root, "remote.git");
  const source = join(root, "source");
  const lanePath = join(root, "lane");
  const runGit = (cwd: string, args: string[]) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  const remoteRef = (ref: string) =>
    execFileSync("git", ["--git-dir", remote, "rev-parse", ref], {
      encoding: "utf8",
    }).trim();

  try {
    execFileSync("git", ["init", "--bare", remote]);
    execFileSync("git", ["clone", remote, source]);
    runGit(source, ["config", "user.name", "Lanes Test"]);
    runGit(source, ["config", "user.email", "lanes@example.test"]);
    writeFileSync(join(source, "tracked.txt"), "base\n");
    runGit(source, ["add", "tracked.txt"]);
    runGit(source, ["commit", "-m", "base"]);
    runGit(source, ["branch", "-M", "main"]);
    runGit(source, ["push", "-u", "origin", "main"]);
    execFileSync("git", ["clone", "--branch", "main", remote, lanePath]);
    runGit(lanePath, ["switch", "--create", "legacy-task", "origin/main"]);
    expect(runGit(lanePath, ["config", "--get", "branch.legacy-task.merge"])).toBe(
      "refs/heads/main",
    );

    const lane = {
      id: "lane-1",
      number: 1,
      path: lanePath,
      project: { ...project, lanes: [{ number: 1, path: lanePath }], remoteUrl: remote },
    };
    prepareLaneGit(lane, "codex/new-task");

    expect(runGit(lanePath, ["branch", "--show-current"])).toBe("codex/new-task");
    expect(runGit(lanePath, ["rev-parse", "HEAD"])).toBe(
      runGit(lanePath, ["rev-parse", "origin/main"]),
    );
    expect(runGit(lanePath, ["config", "--get", "branch.autoSetupMerge"])).toBe("false");
    expect(runGit(lanePath, ["config", "--get", "push.default"])).toBe("current");
    expect(() => runGit(lanePath, ["config", "--get", "branch.legacy-task.merge"])).toThrow();
    expect(() => runGit(lanePath, ["config", "--get", "branch.codex/new-task.merge"])).toThrow();

    runGit(lanePath, ["config", "user.name", "Lanes Test"]);
    runGit(lanePath, ["config", "user.email", "lanes@example.test"]);
    writeFileSync(join(lanePath, "task.txt"), "task\n");
    runGit(lanePath, ["add", "task.txt"]);
    runGit(lanePath, ["commit", "-m", "task"]);
    const mainBeforePush = remoteRef("refs/heads/main");
    expect(runGit(lanePath, ["rev-parse", "HEAD^"])).toBe(mainBeforePush);

    runGit(lanePath, ["push", "origin"]);

    expect(remoteRef("refs/heads/main")).toBe(mainBeforePush);
    expect(remoteRef("refs/heads/codex/new-task")).toBe(runGit(lanePath, ["rev-parse", "HEAD"]));

    const availableLanePath = join(root, "available-lane");
    execFileSync("git", ["clone", "--branch", "main", remote, availableLanePath]);
    prepareLaneGit({ ...lane, id: "lane-2", number: 2, path: availableLanePath });
    expect(runGit(availableLanePath, ["branch", "--show-current"])).toBe("");
    expect(runGit(availableLanePath, ["rev-parse", "HEAD"])).toBe(
      runGit(availableLanePath, ["rev-parse", "origin/main"]),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects invalid or base task branch names", () => {
  expect(() => assertLaneTaskBranch("main", "main")).toThrow(
    "Task branch must differ from the base branch main",
  );
  expect(() => assertLaneTaskBranch("main", "invalid branch")).toThrow("Invalid task branch name");
});

test("releases a clean task branch onto the attached latest base branch", () => {
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

    writeFileSync(join(source, "tracked.txt"), "latest\n");
    runGit(source, ["commit", "-am", "latest"]);
    runGit(source, ["push"]);

    releaseLaneGit({
      id: "lane-1",
      number: 1,
      path: lanePath,
      project: { ...project, lanes: [{ number: 1, path: lanePath }], remoteUrl: remote },
    });

    expect(runGit(lanePath, ["branch", "--show-current"])).toBe("main");
    expect(runGit(lanePath, ["branch", "--list", "task"])).toContain("task");
    expect(runGit(lanePath, ["rev-parse", "HEAD"])).toBe(
      runGit(lanePath, ["rev-parse", "origin/main"]),
    );
    expect(runGit(lanePath, ["status", "--porcelain=v1", "--untracked-files=all"])).toBe("");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("refuses to release uncommitted or untracked Git work", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-release-dirty-"));
  const runGit = (args: string[]) =>
    execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

  try {
    runGit(["init"]);
    runGit(["config", "user.name", "Lanes Test"]);
    runGit(["config", "user.email", "lanes@example.test"]);
    writeFileSync(join(root, "tracked.txt"), "first\n");
    runGit(["add", "tracked.txt"]);
    runGit(["commit", "-m", "first"]);
    runGit(["branch", "-M", "main"]);
    writeFileSync(join(root, "tracked.txt"), "changed\n");
    writeFileSync(join(root, "untracked.txt"), "keep me\n");

    expect(() =>
      releaseLaneGit({
        id: "lane-1",
        number: 1,
        path: root,
        project: { ...project, lanes: [{ number: 1, path: root }] },
      }),
    ).toThrow("has uncommitted or in-progress Git work");

    expect(runGit(["branch", "--show-current"])).toBe("main");
    expect(runGit(["status", "--porcelain=v1", "--untracked-files=all"])).toContain(
      "?? untracked.txt",
    );
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

test("syncs independent lanes concurrently", async () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-sync-concurrent-"));
  const remote = join(root, "remote.git");
  const source = join(root, "source");
  const configPath = join(root, "projects.json");
  const statePath = join(root, "state.json");
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

    const lanePaths = [1, 2].map((number) => {
      const path = join(root, `lane-${number}`);
      execFileSync("git", ["clone", "--branch", "main", remote, path]);
      return { number, path };
    });
    writeFileSync(
      configPath,
      JSON.stringify({
        version: 4,
        projects: [
          {
            ...project,
            id: "concurrent",
            remoteUrl: pathToFileURL(remote).href,
            lanes: lanePaths,
            lanePathPattern: join(root, "lane-{number}"),
          },
        ],
      }),
    );
    writeFileSync(join(source, "tracked.txt"), "latest\n");
    runGit(source, ["commit", "-am", "latest"]);
    runGit(source, ["push"]);

    const runSync = (lane: string) =>
      Bun.spawn(["bun", "src/commands/lanes-cli.ts", "sync", "concurrent", lane], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          LANES_CONFIG_PATH: configPath,
          LANES_STATE_PATH: statePath,
          LANES_STATE_LOCK_PATH: join(root, "state.lock"),
        },
        stdout: "pipe",
        stderr: "pipe",
      });
    const processes = [runSync("lane-1"), runSync("lane-2")];
    const exitCodes = await Promise.all(processes.map((process) => process.exited));

    expect(exitCodes).toEqual([0, 0]);
    for (const { path } of lanePaths) {
      expect(runGit(path, ["rev-parse", "HEAD"])).toBe(runGit(path, ["rev-parse", "origin/main"]));
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unregisters lanes immediately and completes durable cleanup concurrently", async () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-destroy-concurrent-"));
  const remote = join(root, "remote.git");
  const source = join(root, "source");
  const configPath = join(root, "projects.json");
  const statePath = join(root, "state.json");
  const cleanupPath = join(root, "cleanup.json");
  const cleanupLockPath = join(root, "cleanup.lock");
  const runGit = (cwd: string, args: string[]) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

  try {
    execFileSync("git", ["init", "--bare", remote]);
    execFileSync("git", ["clone", remote, source]);
    runGit(source, ["config", "user.name", "Lanes Test"]);
    runGit(source, ["config", "user.email", "lanes@example.test"]);
    writeFileSync(
      join(source, "package.json"),
      JSON.stringify({ scripts: { dev: "bun --version" } }),
    );
    const scriptsDirectory = join(source, "scripts/project-lanes");
    mkdirSync(scriptsDirectory, { recursive: true });
    writeFileSync(
      join(scriptsDirectory, "destroy.ts"),
      `import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const lanePath = process.env.PROJECT_LANE_DEFINITION_ROOT!;
const root = dirname(lanePath);
writeFileSync(join(root, process.env.PROJECT_LANE_ID!), "started");
const deadline = Date.now() + 2_000;
while (!["lane-1", "lane-2"].every((lane) => existsSync(join(root, lane)))) {
  if (Date.now() >= deadline) throw new Error("lane destruction did not overlap");
  await Bun.sleep(20);
}
`,
    );
    runGit(source, ["add", "."]);
    runGit(source, ["commit", "-m", "initial"]);
    runGit(source, ["branch", "-M", "main"]);
    runGit(source, ["push", "-u", "origin", "main"]);

    const lanePaths = [1, 2].map((number) => {
      const path = join(root, `checkout-${number}`);
      execFileSync("git", ["clone", "--branch", "main", remote, path]);
      return { number, path };
    });
    writeFileSync(
      configPath,
      JSON.stringify({
        version: 4,
        projects: [
          {
            ...project,
            id: "concurrent",
            remoteUrl: pathToFileURL(remote).href,
            lanes: lanePaths,
            lanePathPattern: join(root, "checkout-{number}"),
            services: [
              {
                id: "frontend",
                name: "Frontend",
                directory: ".",
                runner: { type: "bun-script", script: "dev" },
              },
            ],
          },
        ],
      }),
    );

    const runDestroy = (lane: string) =>
      Bun.spawn(
        [
          "bun",
          "-e",
          `const { destroyProjectLane } = await import("./src/lib/project-lanes.ts"); await destroyProjectLane("concurrent", "${lane}", true);`,
        ],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            LANES_CONFIG_PATH: configPath,
            LANES_STATE_PATH: statePath,
            LANES_STATE_LOCK_PATH: join(root, "state.lock"),
            LANES_CLEANUP_PATH: cleanupPath,
            LANES_CLEANUP_LOCK_PATH: cleanupLockPath,
          },
          stdout: "pipe",
          stderr: "pipe",
        },
      );
    const processes = [runDestroy("lane-1"), runDestroy("lane-2")];
    const exitCodes = await Promise.all(processes.map((process) => process.exited));

    expect(exitCodes).toEqual([0, 0]);
    expect(lanePaths.every(({ path }) => !existsSync(path))).toBeTrue();
    const installed = JSON.parse(readFileSync(configPath, "utf8")) as {
      projects: Array<{ lanes: unknown[] }>;
    };
    expect(installed.projects[0]?.lanes).toEqual([]);
    const queued = JSON.parse(readFileSync(cleanupPath, "utf8")) as {
      jobs: Array<{ cleanupPath: string; phase: string }>;
    };
    expect(queued.jobs.map(({ phase }) => phase)).toEqual(["ready", "ready"]);
    expect(queued.jobs.every((job) => existsSync(job.cleanupPath))).toBeTrue();

    const cleanup = Bun.spawn(
      [
        "bun",
        "-e",
        `const { runProjectLaneCleanupJobs } = await import("./src/lib/project-lanes.ts"); await runProjectLaneCleanupJobs();`,
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          LANES_CONFIG_PATH: configPath,
          LANES_STATE_PATH: statePath,
          LANES_STATE_LOCK_PATH: join(root, "state.lock"),
          LANES_CLEANUP_PATH: cleanupPath,
          LANES_CLEANUP_LOCK_PATH: cleanupLockPath,
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    expect(await cleanup.exited).toBe(0);
    const completed = JSON.parse(readFileSync(cleanupPath, "utf8")) as { jobs: unknown[] };
    expect(completed.jobs).toEqual([]);
    expect(["lane-1", "lane-2"].every((lane) => existsSync(join(root, lane)))).toBeTrue();
    expect(queued.jobs.every((job) => !existsSync(job.cleanupPath))).toBeTrue();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("persists failed cleanup and succeeds on retry", async () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-cleanup-retry-"));
  const cleanupPath = join(root, ".checkout-1.lanes-cleanup");
  const queuePath = join(root, "cleanup.json");
  const statePath = join(root, "state.json");
  const scriptsDirectory = join(cleanupPath, "scripts/project-lanes");

  try {
    mkdirSync(scriptsDirectory, { recursive: true });
    writeFileSync(
      join(scriptsDirectory, "destroy.ts"),
      `import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
const root = dirname(process.env.PROJECT_LANE_DEFINITION_ROOT!);
if (!existsSync(join(root, "allow-cleanup"))) throw new Error("cleanup unavailable");
`,
    );
    writeFileSync(
      queuePath,
      JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "project-lane-1-test",
            project,
            laneId: "lane-1",
            laneNumber: 1,
            originalPath: join(root, "checkout-1"),
            cleanupPath,
            phase: "ready",
            createdAt: new Date().toISOString(),
            attempts: 0,
          },
        ],
      }),
    );

    const runCleanup = () =>
      Bun.spawn(
        [
          "bun",
          "-e",
          `const { runProjectLaneCleanupJobs } = await import("./src/lib/project-lanes.ts"); await runProjectLaneCleanupJobs();`,
        ],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            LANES_STATE_PATH: statePath,
            LANES_STATE_LOCK_PATH: join(root, "state.lock"),
            LANES_CLEANUP_PATH: queuePath,
            LANES_CLEANUP_LOCK_PATH: join(root, "cleanup.lock"),
          },
          stdout: "pipe",
          stderr: "pipe",
        },
      );

    expect(await runCleanup().exited).toBe(0);
    const failed = JSON.parse(readFileSync(queuePath, "utf8")) as {
      jobs: Array<{ phase: string; attempts: number; lastError?: string }>;
    };
    expect(failed.jobs[0]).toMatchObject({ phase: "ready", attempts: 1 });
    expect(failed.jobs[0]?.lastError).toContain("cleanup unavailable");
    expect(existsSync(cleanupPath)).toBeTrue();

    writeFileSync(join(root, "allow-cleanup"), "ready");
    expect(await runCleanup().exited).toBe(0);
    const completed = JSON.parse(readFileSync(queuePath, "utf8")) as { jobs: unknown[] };
    expect(completed.jobs).toEqual([]);
    expect(existsSync(cleanupPath)).toBeFalse();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("restores a registered lane after interrupted removal preparation", async () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-cleanup-reconcile-"));
  const originalPath = join(root, "checkout-1");
  const cleanupPath = join(root, ".checkout-1.lanes-cleanup");
  const configPath = join(root, "projects.json");
  const queuePath = join(root, "cleanup.json");
  const configuredProject = {
    ...project,
    lanes: [{ number: 1, path: originalPath }],
    lanePathPattern: join(root, "checkout-{number}"),
  };

  try {
    mkdirSync(cleanupPath, { recursive: true });
    writeFileSync(join(cleanupPath, "kept.txt"), "keep");
    writeFileSync(configPath, JSON.stringify({ version: 4, projects: [configuredProject] }));
    writeFileSync(
      queuePath,
      JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "project-lane-1-preparing",
            project: configuredProject,
            laneId: "lane-1",
            laneNumber: 1,
            originalPath,
            cleanupPath,
            phase: "preparing",
            createdAt: new Date().toISOString(),
            attempts: 0,
          },
        ],
      }),
    );

    const cleanup = Bun.spawn(
      [
        "bun",
        "-e",
        `const { runProjectLaneCleanupJobs } = await import("./src/lib/project-lanes.ts"); await runProjectLaneCleanupJobs();`,
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          LANES_CONFIG_PATH: configPath,
          LANES_STATE_PATH: join(root, "state.json"),
          LANES_STATE_LOCK_PATH: join(root, "state.lock"),
          LANES_CLEANUP_PATH: queuePath,
          LANES_CLEANUP_LOCK_PATH: join(root, "cleanup.lock"),
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );

    expect(await cleanup.exited).toBe(0);
    expect(existsSync(join(originalPath, "kept.txt"))).toBeTrue();
    expect(existsSync(cleanupPath)).toBeFalse();
    const reconciled = JSON.parse(readFileSync(queuePath, "utf8")) as { jobs: unknown[] };
    expect(reconciled.jobs).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
