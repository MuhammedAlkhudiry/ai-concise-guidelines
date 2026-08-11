import { afterEach, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { cleanLaravelS3Prefix, cleanTestingDatabases, ensureLaravelAppKey } from "./resources";
import type { ProjectEnvironmentContext } from "./types";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
});

test("cleans only the lane-owned Laravel parallel testing database family", () => {
  const root = mkdtempSync(resolve(tmpdir(), "project-environment-resources-"));
  temporaryDirectories.push(root);
  const log = resolve(root, "mysql.log");
  const mysql = resolve(root, "mysql");
  writeFileSync(
    mysql,
    `#!/bin/sh
case "$*" in
  *"SELECT SCHEMA_NAME"*)
    printf '%s\\n' example_lane_3_testing example_lane_3_testing_test_1 example_lane_3_testing_test_8
    ;;
  *)
    printf '%s\\n' "$*" >> '${log}'
    ;;
esac
`,
  );
  chmodSync(mysql, 0o755);
  const context = {
    root,
    lane: "lane-3",
    testingDatabase: "example_lane_3_testing",
    mysqlCommand: mysql,
    herdBin: root,
  } as ProjectEnvironmentContext;

  cleanTestingDatabases(context);

  const commands = readFileSync(log, "utf8");
  expect(commands).toContain("DROP DATABASE IF EXISTS `example_lane_3_testing`");
  expect(commands).toContain("DROP DATABASE IF EXISTS `example_lane_3_testing_test_1`");
  expect(commands).toContain("DROP DATABASE IF EXISTS `example_lane_3_testing_test_8`");
  expect(commands).not.toContain("example_lane_2");
});

test("copies the lane application key into the Laravel testing environment", () => {
  const root = mkdtempSync(resolve(tmpdir(), "project-environment-app-key-"));
  temporaryDirectories.push(root);
  const backendDir = resolve(root, "app");
  mkdirSync(backendDir, { recursive: true });
  writeFileSync(resolve(backendDir, ".env"), "APP_KEY=base64:lane-key\n");
  writeFileSync(resolve(backendDir, ".env.testing"), "APP_ENV=testing\n");

  ensureLaravelAppKey({ backendDir } as ProjectEnvironmentContext);

  expect(readFileSync(resolve(backendDir, ".env.testing"), "utf8")).toContain(
    "APP_KEY=base64:lane-key",
  );
});

test("rejects broad or unsafe S3 cleanup prefixes before invoking Laravel", () => {
  expect(() => cleanLaravelS3Prefix({} as ProjectEnvironmentContext, "/")).toThrow(
    "Unsafe S3 cleanup prefix",
  );
  expect(() => cleanLaravelS3Prefix({} as ProjectEnvironmentContext, "../other-lane")).toThrow(
    "Unsafe S3 cleanup prefix",
  );
});
