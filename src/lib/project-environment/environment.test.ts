import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import {
  expoEnvironmentValues,
  laravelEnvironmentValues,
  laravelTestingEnvironmentValues,
  removeProjectEnvironmentFiles,
  setupExpoEnvironment,
  setupLaravelEnvironment,
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
    testingDatabase: "example_lane_3_testing",
    prefix: "example_lane_3",
    sessionCookie: "example_lane_3_session",
    bucket: "example-lane-3",
    metroPort: "7003",
    simulatorName: "Example Lane 3",
    herdCertificate: "/herd/Certificates/example-lane-3.test.crt",
    herdKey: "/herd/Certificates/example-lane-3.test.key",
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
      VITE_DEV_SERVER_CERT: "/herd/Certificates/example-lane-3.test.crt",
      VITE_DEV_SERVER_KEY: "/herd/Certificates/example-lane-3.test.key",
      AWS_BUCKET: "example-lane-3",
      CACHE_PREFIX: "custom_cache",
      PROJECT_VALUE: "yes",
    });
  });

  test("writes and removes a lane-owned Laravel testing environment", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-"));
    temporaryDirectories.push(root);
    const project = context(root);
    mkdirSync(project.backendDir, { recursive: true });
    mkdirSync(project.mobileDir, { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "APP_NAME=Example\n");

    setupLaravelEnvironment(project);

    expect(laravelTestingEnvironmentValues(project)).toMatchObject({
      APP_ENV: "testing",
      DB_DATABASE: "example_lane_3_testing",
    });
    expect(readFileSync(resolve(project.backendDir, ".env.testing"), "utf8")).toContain(
      "DB_DATABASE=example_lane_3_testing",
    );

    removeProjectEnvironmentFiles(project);

    expect(() => readFileSync(resolve(project.backendDir, ".env.testing"), "utf8")).toThrow();
  });

  test("quotes and reads Herd paths containing spaces", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project environment "));
    temporaryDirectories.push(root);
    const project = context(root);
    project.herdCertificate = "/Application Support/Herd/example.crt";
    project.herdKey = "/Application Support/Herd/example.key";
    mkdirSync(project.backendDir, { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "APP_NAME=Example\n");

    setupLaravelEnvironment(project);

    const contents = readFileSync(resolve(project.backendDir, ".env"), "utf8");
    expect(contents).toContain('VITE_DEV_SERVER_CERT="/Application Support/Herd/example.crt"');
    expect(contents).toContain('VITE_DEV_SERVER_KEY="/Application Support/Herd/example.key"');
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
