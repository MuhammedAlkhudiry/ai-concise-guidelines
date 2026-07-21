import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import {
  expoEnvironmentValues,
  laravelEnvironmentValues,
  setupExpoEnvironment,
} from "./environment";
import type { ProjectEnvironmentContext } from "./types";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
});

function context(root: string): ProjectEnvironmentContext {
  return {
    root,
    backendDir: resolve(root, "backend"),
    mobileDir: resolve(root, "mobile"),
    appUrl: "https://example-lane-3.test",
    database: "example_lane_3",
    prefix: "example_lane_3",
    sessionCookie: "example_lane_3_session",
    bucket: "example-lane-3",
    metroPort: "7003",
    simulatorName: "Example Lane 3",
  } as ProjectEnvironmentContext;
}

describe("project environment files", () => {
  test("builds conventional Laravel lane values with project overrides", () => {
    const values = laravelEnvironmentValues(context("/project"), {
      values: { CACHE_PREFIX: "custom_cache", PROJECT_VALUE: "yes" },
    });

    expect(values).toMatchObject({
      APP_URL: "https://example-lane-3.test",
      DB_DATABASE: "example_lane_3",
      AWS_BUCKET: "example-lane-3",
      CACHE_PREFIX: "custom_cache",
      PROJECT_VALUE: "yes",
    });
  });

  test("maps Expo keys and preserves selected local credentials", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-"));
    temporaryDirectories.push(root);
    const project = context(root);
    mkdirSync(project.mobileDir, { recursive: true });
    writeFileSync(
      resolve(project.mobileDir, ".env.local"),
      "EXPO_PUBLIC_GOOGLE_CLIENT_ID=local-client\nOLD_VALUE=remove-me\n",
    );
    const options = {
      apiUrlKeys: ["EXPO_PUBLIC_APP_URL", "EXPO_PUBLIC_IOS_APP_URL"],
      metroPortKeys: ["EXPO_DEV_SERVER_PORT"],
      simulatorNameKey: "EXPO_IOS_SIMULATOR",
      preserveKeys: ["EXPO_PUBLIC_GOOGLE_CLIENT_ID"],
    };

    setupExpoEnvironment(project, options);

    expect(expoEnvironmentValues(project, options)).toEqual({
      EXPO_PUBLIC_APP_URL: "https://example-lane-3.test",
      EXPO_PUBLIC_IOS_APP_URL: "https://example-lane-3.test",
      EXPO_DEV_SERVER_PORT: "7003",
      EXPO_IOS_SIMULATOR: "Example Lane 3",
    });
    expect(readFileSync(resolve(project.mobileDir, ".env.local"), "utf8")).toContain(
      "EXPO_PUBLIC_GOOGLE_CLIENT_ID=local-client",
    );
  });
});
