import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import { createLanesConfig, readLanesConfig, type ActiveProject } from "./lanes-config";

const project: ActiveProject = {
  id: "project",
  name: "Project",
  remoteUrl: "https://example.com/project.git",
  baseBranch: "main",
  canonicalRoot: "/projects/project",
  environmentVariable: "PROJECT_LANE_ROOT",
  services: [
    {
      id: "frontend",
      name: "Frontend",
      directory: "app",
      runner: { type: "bun-script", script: "dev" },
    },
  ],
};

test("creates a static project catalog without task environments", () => {
  expect(createLanesConfig([project])).toEqual({ version: 5, projects: [project] });
});

test("migrates the old clone catalog to a canonical project root", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-config-"));
  const path = join(root, "projects.json");
  try {
    writeFileSync(
      path,
      JSON.stringify({
        version: 4,
        projects: [
          {
            ...project,
            canonicalRoot: undefined,
            lanePathPattern: "/projects/project-lane-{number}",
            lanes: [{ number: 1, path: "/projects/project-lane-1" }],
          },
        ],
      }),
    );

    expect(readLanesConfig(path)).toEqual({ version: 5, projects: [project] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects duplicate service ids", () => {
  expect(() =>
    createLanesConfig([{ ...project, services: [project.services[0]!, project.services[0]!] }]),
  ).toThrow("Lane service ids must be unique");
});
