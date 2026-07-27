import { afterEach, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { cleanTestingDatabases } from "./resources";
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
