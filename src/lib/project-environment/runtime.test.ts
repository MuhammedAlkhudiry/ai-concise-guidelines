import { afterEach, expect, test } from "bun:test";

import { createProjectEnvironmentContext } from "./runtime";

const rootEnvironmentVariable = "TEST_PROJECT_LANE_ROOT";
const originalDefinitionRoot = process.env.PROJECT_LANE_DEFINITION_ROOT;
const originalProjectRoot = process.env[rootEnvironmentVariable];

afterEach(() => {
  if (originalDefinitionRoot === undefined) delete process.env.PROJECT_LANE_DEFINITION_ROOT;
  else process.env.PROJECT_LANE_DEFINITION_ROOT = originalDefinitionRoot;

  if (originalProjectRoot === undefined) delete process.env[rootEnvironmentVariable];
  else process.env[rootEnvironmentVariable] = originalProjectRoot;
});

test("derives every shared lane identity from the clone root", () => {
  delete process.env.PROJECT_LANE_DEFINITION_ROOT;
  delete process.env[rootEnvironmentVariable];

  const context = createProjectEnvironmentContext({
    id: "example",
    name: "Example",
    rootEnvironmentVariable,
    backendDirectory: "backend",
    mobileDirectory: "mobile",
    metroPortBase: 7000,
    defaultRoot: "/projects/example-lane-2",
    assetUrl: (bucket) => `https://assets.test/${bucket}`,
  });

  expect(context).toMatchObject({
    root: "/projects/example-lane-2",
    backendDir: "/projects/example-lane-2/backend",
    mobileDir: "/projects/example-lane-2/mobile",
    lane: "lane-2",
    laneNumber: 2,
    site: "example-lane-2",
    appUrl: "https://example-lane-2.test",
    database: "example_lane_2",
    prefix: "example_lane_2",
    sessionCookie: "example_lane_2_session",
    bucket: "example-lane-2",
    assetUrl: "https://assets.test/example-lane-2",
    metroPort: "7002",
    simulatorName: "Example Lane 2",
    soloProjectName: "example-lane-2",
  });
});

test("rejects conflicting orchestrator and project roots", () => {
  process.env.PROJECT_LANE_DEFINITION_ROOT = "/projects/example/lane-1";
  process.env[rootEnvironmentVariable] = "/projects/example/lane-2";

  expect(() =>
    createProjectEnvironmentContext({
      id: "example",
      name: "Example",
      rootEnvironmentVariable,
      backendDirectory: "backend",
      mobileDirectory: "mobile",
      metroPortBase: 7000,
      defaultRoot: "/projects/example/lane-3",
    }),
  ).toThrow("Lane root mismatch");
});
