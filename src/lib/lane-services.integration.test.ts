import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, expect, test } from "bun:test";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

test("controls and reads logs for a launchd-backed lane service", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-services-"));
  roots.push(root);
  const lanePath = join(root, "project-lane-1");
  const appPath = join(lanePath, "app");
  const configPath = join(root, "projects.json");
  const statePath = join(root, "state");
  mkdirSync(appPath, { recursive: true });
  writeFileSync(
    join(appPath, "package.json"),
    JSON.stringify({
      scripts: { dev: "echo service-ready:$EXPO_DEV_SERVER_PORT; sleep 30 #" },
    }),
  );
  writeFileSync(join(appPath, ".env.local"), "EXPO_DEV_SERVER_PORT=9123\n");
  writeFileSync(
    configPath,
    JSON.stringify({
      version: 3,
      projects: [
        {
          id: "service-test",
          name: "Service Test",
          remoteUrl: "https://example.com/project.git",
          baseBranch: "main",
          lanes: [{ number: 1, path: lanePath }],
          environmentVariable: "SERVICE_TEST_ROOT",
          services: [
            {
              id: "frontend",
              name: "Frontend",
              directory: "app",
              runner: { type: "bun-script", script: "dev" },
            },
          ],
        },
      ],
    }),
  );

  const run = (args: string[]) =>
    Bun.spawnSync(["bun", "src/commands/lanes-cli.ts", ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        LANES_CONFIG_PATH: configPath,
        XDG_STATE_HOME: statePath,
      },
    });

  try {
    const started = run(["services", "start", "service-test", "lane-1", "frontend", "--json"]);
    expect(started.exitCode).toBe(0);
    expect(JSON.parse(started.stdout.toString()).lanes[0].services[1].state).toBe("running");

    const logs = run(["services", "logs", "service-test", "lane-1", "frontend", "--lines", "10"]);
    expect(logs.exitCode).toBe(0);
    expect(logs.stdout.toString()).toContain("service-ready:9123");
  } finally {
    const stopped = run(["services", "stop", "service-test", "lane-1", "frontend", "--json"]);
    expect(stopped.exitCode).toBe(0);
    const services = JSON.parse(stopped.stdout.toString()).lanes[0].services;
    expect(services[0]).toMatchObject({
      id: "site",
      state: "stopped",
      detail: "Frontend is stopped",
    });
    expect(services[1].state).toBe("stopped");
  }
}, 20_000);

test("controls every lane and service in a project", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-service-fleet-"));
  roots.push(root);
  const configPath = join(root, "projects.json");
  const statePath = join(root, "state");
  const lanes = [1, 2].map((number) => {
    const lanePath = join(root, `project-lane-${number}`);
    const appPath = join(lanePath, "app");
    mkdirSync(appPath, { recursive: true });
    writeFileSync(
      join(appPath, "package.json"),
      JSON.stringify({ scripts: { dev: `echo fleet-ready:${number}; sleep 30 #` } }),
    );
    return { number, path: lanePath };
  });
  writeFileSync(
    configPath,
    JSON.stringify({
      version: 3,
      projects: [
        {
          id: "service-fleet",
          name: "Service Fleet",
          remoteUrl: "https://example.com/project.git",
          baseBranch: "main",
          lanes,
          environmentVariable: "SERVICE_FLEET_ROOT",
          services: [
            {
              id: "frontend",
              name: "Frontend",
              directory: "app",
              runner: { type: "bun-script", script: "dev" },
            },
          ],
        },
      ],
    }),
  );

  const run = (args: string[]) =>
    Bun.spawnSync(["bun", "src/commands/lanes-cli.ts", ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        LANES_CONFIG_PATH: configPath,
        XDG_STATE_HOME: statePath,
      },
    });

  try {
    const started = run(["services", "start", "service-fleet", "all", "all", "--json"]);
    expect(started.exitCode).toBe(0);
    const statuses = JSON.parse(started.stdout.toString()).lanes;
    expect(statuses).toHaveLength(2);
    expect(
      statuses.every(
        ({ services }: { services: { state: string }[] }) => services[1]?.state === "running",
      ),
    ).toBe(true);
  } finally {
    const stopped = run(["services", "stop", "service-fleet", "all", "all", "--json"]);
    expect(stopped.exitCode).toBe(0);
    const statuses = JSON.parse(stopped.stdout.toString()).lanes;
    expect(
      statuses.every(
        ({ services }: { services: { state: string }[] }) => services[1]?.state === "stopped",
      ),
    ).toBe(true);
  }
}, 60_000);
