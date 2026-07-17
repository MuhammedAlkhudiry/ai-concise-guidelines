import { expect, test } from "bun:test";

import { getProjectLanes } from "./project-lanes";

test("uses each configured lane path directly", () => {
  const paths = ["/projects/project-lane-1", "/projects/project-lane-2"];
  const lanes = getProjectLanes({
    id: "project",
    name: "Project",
    remoteUrl: "https://example.com/project.git",
    baseBranch: "main",
    lanePaths: paths,
    environmentVariable: "PROJECT_LANE_ROOT",
  });

  expect(lanes.map(({ id }) => id)).toEqual(["lane-1", "lane-2"]);
  expect(lanes.map(({ path }) => path)).toEqual(paths);
});
