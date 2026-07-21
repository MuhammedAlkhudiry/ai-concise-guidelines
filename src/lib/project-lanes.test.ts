import { expect, test } from "bun:test";

import { getProjectLanes, selectProjectLane, simulatorFleetFailures } from "./project-lanes";

const project = {
  id: "project",
  name: "Project",
  remoteUrl: "https://example.com/project.git",
  baseBranch: "main",
  lanes: [
    { number: 1, path: "/projects/project-lane-1" },
    { number: 2, path: "/projects/project-lane-2" },
  ],
  environmentVariable: "PROJECT_LANE_ROOT",
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
    lanes: configuredLanes,
    environmentVariable: "PROJECT_LANE_ROOT",
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
