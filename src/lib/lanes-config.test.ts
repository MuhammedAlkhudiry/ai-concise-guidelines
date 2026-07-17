import { expect, test } from "bun:test";

import { createLanesConfig } from "./lanes-config";

test("creates the installed standalone lanes catalog", () => {
  const config = createLanesConfig([
    {
      id: "project",
      name: "Project",
      remoteUrl: "https://example.com/project.git",
      baseBranch: "main",
      lanePaths: ["/projects/project-lane-1"],
      environmentVariable: "PROJECT_LANE_ROOT",
    },
  ]);

  expect(config).toEqual({
    version: 1,
    projects: [
      {
        id: "project",
        name: "Project",
        remoteUrl: "https://example.com/project.git",
        baseBranch: "main",
        lanePaths: ["/projects/project-lane-1"],
        environmentVariable: "PROJECT_LANE_ROOT",
      },
    ],
  });
});
