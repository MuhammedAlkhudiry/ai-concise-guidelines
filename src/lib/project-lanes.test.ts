import { describe, expect, test } from "bun:test";

import { chooseReadyLane, type LaneStatus } from "./project-lanes";

function status(id: string, value: LaneStatus["status"]): LaneStatus {
  return {
    lane: {
      id,
      path: `/lanes/${id}`,
      project: {
        id: "project",
        name: "Project",
        remoteUrl: "https://example.com/project.git",
        baseBranch: "main",
        laneRoot: "/lanes",
        laneCount: 3,
        environmentVariable: "PROJECT_LANE_ROOT",
      },
    },
    state: {},
    status: value,
  };
}

describe("chooseReadyLane", () => {
  test("selects the first ready lane without considering occupied lanes", () => {
    expect(
      chooseReadyLane([
        status("lane-1", "in-use"),
        status("lane-2", "ready"),
        status("lane-3", "ready"),
      ]).lane.id,
    ).toBe("lane-2");
  });

  test("refuses a fourth task when every lane is unavailable", () => {
    expect(() =>
      chooseReadyLane([
        status("lane-1", "in-use"),
        status("lane-2", "in-use"),
        status("lane-3", "needs-attention"),
      ]),
    ).toThrow("No project lane is ready");
  });
});
