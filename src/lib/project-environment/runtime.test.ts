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
  process.env.PROJECT_LANE_ID = "excel-tree-import";
  process.env.PROJECT_LANE_NUMBER = "2";

  const context = createProjectEnvironmentContext(
    {
      id: "example",
      name: "Example",
      rootEnvironmentVariable,
      backendDirectory: "backend",
      mobileDirectory: "mobile",
      metroPortBase: 7000,
      vitePortBase: 7100,
      defaultRoot: "/projects/excel-tree-import",
      assetUrl: (bucket) => `https://assets.test/${bucket}`,
    },
    ["agent", "mutation"],
  );

  expect(context).toMatchObject({
    root: "/projects/excel-tree-import",
    backendDir: "/projects/excel-tree-import/backend",
    mobileDir: "/projects/excel-tree-import/mobile",
    lane: "excel-tree-import",
    laneNumber: 2,
    site: "example-excel-tree-import",
    appUrl: "https://example-excel-tree-import.test",
    database: "example_excel_tree_import",
    testingDatabase: "example_excel_tree_import_testing",
    agentDatabase: "example_excel_tree_import_agent",
    mutationDatabase: "example_excel_tree_import_mutation",
    prefix: "example_excel_tree_import",
    sessionCookie: "example_excel_tree_import_session",
    bucket: "example-excel-tree-import",
    assetUrl: "https://assets.test/example-excel-tree-import",
    metroPort: "7002",
    vitePort: "7102",
    simulatorName: "Example excel-tree-import",
    herdCertificateAuthority: expect.stringContaining(
      "Herd/config/valet/CA/LaravelValetCASelfSigned.pem",
    ),
    herdCertificate: expect.stringContaining(
      "Herd/config/valet/Certificates/example-excel-tree-import.test.crt",
    ),
    herdKey: expect.stringContaining(
      "Herd/config/valet/Certificates/example-excel-tree-import.test.key",
    ),
  });
});

test("derives stable resources for the canonical project clone", () => {
  delete process.env.PROJECT_LANE_DEFINITION_ROOT;
  delete process.env[rootEnvironmentVariable];
  process.env.PROJECT_LANE_ID = "main";
  process.env.PROJECT_LANE_NUMBER = "0";

  const context = createProjectEnvironmentContext({
    id: "example",
    name: "Example",
    rootEnvironmentVariable,
    backendDirectory: "backend",
    mobileDirectory: "mobile",
    metroPortBase: 7000,
    defaultRoot: "/projects/example",
  });

  expect(context).toMatchObject({
    root: "/projects/example",
    lane: "main",
    laneNumber: 0,
    site: "example-main",
    appUrl: "https://example-main.test",
    database: "example_main",
    testingDatabase: "example_main_testing",
    bucket: "example-main",
    metroPort: "7000",
    vitePort: "5173",
    simulatorName: "Example Main",
  });
});

test("omits optional database roles unless the adapter declares them", () => {
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
  });

  expect(context.agentDatabase).toBeUndefined();
  expect(context.mutationDatabase).toBeUndefined();
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

test("rejects the canonical identity with a task slot", () => {
  process.env.PROJECT_LANE_ID = "main";
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
  ).toThrow("Invalid environment identity and slot");
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
