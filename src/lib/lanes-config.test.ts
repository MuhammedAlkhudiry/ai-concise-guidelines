import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import {
  addLaneDefinition,
  createLanesConfig,
  readLanesConfig,
  removeLaneDefinition,
  type ActiveProject,
} from "./lanes-config";

const project: ActiveProject = {
  id: "project",
  name: "Project",
  remoteUrl: "https://example.com/project.git",
  baseBranch: "main",
  lanePathPattern: "/projects/project-lane-{number}",
  lanes: [{ number: 1, path: "/projects/project-lane-1" }],
  environmentVariable: "PROJECT_LANE_ROOT",
  pullRequest: { model: "gpt-5.6-terra" },
  services: [
    {
      id: "frontend",
      name: "Frontend",
      directory: "app",
      runner: { type: "bun-script", script: "dev" },
    },
  ],
};

test("creates the installed standalone lanes catalog", () => {
  expect(createLanesConfig([project])).toEqual({ version: 4, projects: [project] });
});

test("preserves locally registered lanes while updating project definitions", () => {
  const installed = addLaneDefinition(createLanesConfig([project]), "project", 2).config;
  const merged = createLanesConfig([{ ...project, name: "Updated Project" }], installed);

  expect(merged.projects[0]?.name).toBe("Updated Project");
  expect(merged.projects[0]?.lanes.map(({ number }) => number)).toEqual([1, 2]);
});

test("adds the first available lane number and removes registered lanes", () => {
  const withThree = addLaneDefinition(createLanesConfig([project]), "project", 3).config;
  const withoutOne = removeLaneDefinition(withThree, "project", "lane-1");
  const addition = addLaneDefinition(withoutOne, "project");

  expect(addition.lane).toEqual({ number: 1, path: "/projects/project-lane-1" });
  expect(addition.config.projects[0]?.lanes.map(({ number }) => number)).toEqual([1, 3]);
});

test("migrates the version 3 catalog and infers its lane path pattern", () => {
  const root = mkdtempSync(join(tmpdir(), "lanes-config-"));
  const path = join(root, "projects.json");
  try {
    const { lanePathPattern: _, ...legacyProject } = project;
    writeFileSync(path, JSON.stringify({ version: 3, projects: [legacyProject] }));

    const migrated = readLanesConfig(path);

    expect(migrated.version).toBe(4);
    expect(migrated.projects[0]?.lanePathPattern).toBe("/projects/project-lane-{number}");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects duplicate lane numbers", () => {
  expect(() =>
    createLanesConfig([
      {
        ...project,
        lanes: [
          { number: 1, path: "/projects/first" },
          { number: 1, path: "/projects/second" },
        ],
      },
    ]),
  ).toThrow("Lane numbers must be unique");
});

test("rejects an empty pull-request automation model", () => {
  expect(() =>
    createLanesConfig([
      {
        ...project,
        pullRequest: { model: "" },
      },
    ]),
  ).toThrow();
});
