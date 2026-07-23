import { expect, test } from "bun:test";

import { createLanesConfig } from "./lanes-config";

test("creates the installed standalone lanes catalog", () => {
  const config = createLanesConfig([
    {
      id: "project",
      name: "Project",
      remoteUrl: "https://example.com/project.git",
      baseBranch: "main",
      lanes: [{ number: 1, path: "/projects/project-lane-1" }],
      environmentVariable: "PROJECT_LANE_ROOT",
      services: [
        {
          id: "frontend",
          name: "Frontend",
          directory: "app",
          runner: { type: "bun-script", script: "dev" },
        },
      ],
    },
  ]);

  expect(config).toEqual({
    version: 3,
    projects: [
      {
        id: "project",
        name: "Project",
        remoteUrl: "https://example.com/project.git",
        baseBranch: "main",
        lanes: [{ number: 1, path: "/projects/project-lane-1" }],
        environmentVariable: "PROJECT_LANE_ROOT",
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
  });
});

test("rejects duplicate lane numbers", () => {
  expect(() =>
    createLanesConfig([
      {
        id: "project",
        name: "Project",
        remoteUrl: "https://example.com/project.git",
        baseBranch: "main",
        lanes: [
          { number: 1, path: "/projects/first" },
          { number: 1, path: "/projects/second" },
        ],
        environmentVariable: "PROJECT_LANE_ROOT",
        services: [
          {
            id: "frontend",
            name: "Frontend",
            directory: "app",
            runner: { type: "bun-script", script: "dev" },
          },
        ],
      },
    ]),
  ).toThrow("Lane numbers must be unique");
});
