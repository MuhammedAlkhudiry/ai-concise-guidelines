import { afterEach, expect, test } from "bun:test";

import { createProjectEnvironmentContext } from "./runtime";

const rootEnvironmentVariable = "TEST_PROJECT_LANE_ROOT";
const originalDefinitionRoot = process.env.PROJECT_LANE_DEFINITION_ROOT;
const originalLaneId = process.env.PROJECT_LANE_ID;
const originalLaneNumber = process.env.PROJECT_LANE_NUMBER;
const originalProjectRoot = process.env[rootEnvironmentVariable];
const originalSimSlimEnabled = process.env.PROJECT_LANE_SIMSLIM_ENABLED;
const originalSimSlimCategories = process.env.PROJECT_LANE_SIMSLIM_EXCEPT_CATEGORIES;
const originalSimSlimServices = process.env.PROJECT_LANE_SIMSLIM_KEEP_SERVICES;

afterEach(() => {
  if (originalDefinitionRoot === undefined) delete process.env.PROJECT_LANE_DEFINITION_ROOT;
  else process.env.PROJECT_LANE_DEFINITION_ROOT = originalDefinitionRoot;

  if (originalLaneId === undefined) delete process.env.PROJECT_LANE_ID;
  else process.env.PROJECT_LANE_ID = originalLaneId;

  if (originalLaneNumber === undefined) delete process.env.PROJECT_LANE_NUMBER;
  else process.env.PROJECT_LANE_NUMBER = originalLaneNumber;

  if (originalProjectRoot === undefined) delete process.env[rootEnvironmentVariable];
  else process.env[rootEnvironmentVariable] = originalProjectRoot;

  if (originalSimSlimEnabled === undefined) delete process.env.PROJECT_LANE_SIMSLIM_ENABLED;
  else process.env.PROJECT_LANE_SIMSLIM_ENABLED = originalSimSlimEnabled;
  if (originalSimSlimCategories === undefined)
    delete process.env.PROJECT_LANE_SIMSLIM_EXCEPT_CATEGORIES;
  else process.env.PROJECT_LANE_SIMSLIM_EXCEPT_CATEGORIES = originalSimSlimCategories;
  if (originalSimSlimServices === undefined) delete process.env.PROJECT_LANE_SIMSLIM_KEEP_SERVICES;
  else process.env.PROJECT_LANE_SIMSLIM_KEEP_SERVICES = originalSimSlimServices;
});

test("derives shared resources from the explicit lane identity", () => {
  delete process.env.PROJECT_LANE_DEFINITION_ROOT;
  delete process.env[rootEnvironmentVariable];
  process.env.PROJECT_LANE_ID = "lane-2";
  process.env.PROJECT_LANE_NUMBER = "2";

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
    herdCertificateAuthority: expect.stringContaining(
      "Herd/config/valet/CA/LaravelValetCASelfSigned.pem",
    ),
  });
});

test("rejects conflicting orchestrator and project roots", () => {
  process.env.PROJECT_LANE_ID = "lane-1";
  process.env.PROJECT_LANE_NUMBER = "1";
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

test("rejects mismatched explicit lane identity", () => {
  process.env.PROJECT_LANE_ID = "lane-3";
  process.env.PROJECT_LANE_NUMBER = "2";

  expect(() =>
    createProjectEnvironmentContext({
      id: "example",
      name: "Example",
      rootEnvironmentVariable,
      backendDirectory: "backend",
      mobileDirectory: "mobile",
      metroPortBase: 7000,
      defaultRoot: "/projects/custom",
    }),
  ).toThrow("Lane identity mismatch");
});

test("reads the simulator slimming profile provided by the lane orchestrator", () => {
  process.env.PROJECT_LANE_ID = "lane-1";
  process.env.PROJECT_LANE_NUMBER = "1";
  process.env.PROJECT_LANE_SIMSLIM_ENABLED = "1";
  process.env.PROJECT_LANE_SIMSLIM_EXCEPT_CATEGORIES = "icloud,store";
  process.env.PROJECT_LANE_SIMSLIM_KEEP_SERVICES = "com.apple.example";

  const context = createProjectEnvironmentContext({
    id: "example",
    name: "Example",
    rootEnvironmentVariable,
    backendDirectory: "backend",
    mobileDirectory: "mobile",
    metroPortBase: 7000,
    defaultRoot: "/projects/example-lane-1",
  });

  expect(context.simulatorSlimming).toEqual({
    exceptCategories: ["icloud", "store"],
    keepServices: ["com.apple.example"],
  });
});
