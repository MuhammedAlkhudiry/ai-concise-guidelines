import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";
import { execa } from "execa";

test("provisions canonical and task environments, then destroys only task resources", async () => {
  const fixture = mkdtempSync(join(tmpdir(), "project-environments-"));
  const canonicalRoot = join(fixture, "awraq-project");
  const taskRoot = join(fixture, "excel-tree-import");
  const configPath = join(fixture, "projects.json");
  const statePath = join(fixture, "state.json");
  const logPath = join(fixture, "operations.log");
  const adapterPath = join(fixture, "adapter.ts");
  mkdirSync(canonicalRoot);
  mkdirSync(taskRoot);
  writeFileSync(
    configPath,
    JSON.stringify({
      version: 5,
      projects: [
        {
          id: "awraq",
          name: "Awraq",
          remoteUrl: "https://github.com/example/awraq-project.git",
          baseBranch: "main",
          canonicalRoot,
          environmentVariable: "AWRAQ_LANE_ROOT",
          services: [
            {
              id: "frontend",
              name: "Frontend",
              directory: ".",
              runner: { type: "bun-script", script: "dev" },
            },
          ],
        },
      ],
    }),
  );
  writeFileSync(
    adapterPath,
    `import { appendFileSync } from "node:fs";
const record = (operation: string) => async () => appendFileSync(process.env.TEST_OPERATION_LOG!, operation + "\\n");
export const adapter = { databaseRoles: [], operations: {
  setup: record("setup"),
  "mobile-development": record("mobile-development"),
  verify: record("verify"),
  reset: record("reset"),
  destroy: record("destroy"),
} };\n`,
  );

  const environment = {
    ...process.env,
    LANES_CONFIG_PATH: configPath,
    LANES_STATE_PATH: statePath,
    LANES_STATE_LOCK_PATH: join(fixture, "state.lock"),
    PROJECT_LANES_TEST_ADAPTER_MODULE: adapterPath,
    TEST_OPERATION_LOG: logPath,
  };

  try {
    const source = join(import.meta.dir, "project-lanes.ts");
    const script = `
      const lanes = await import(${JSON.stringify(source)});
      const main = await lanes.provisionProjectLane("awraq", "main", { compact: true });
      const task = await lanes.provisionProjectLane("awraq", "excel-tree-import", { root: ${JSON.stringify(taskRoot)}, compact: true });
      await lanes.destroyProjectLane("awraq", "excel-tree-import", true);
      let mainDestroyError;
      try { await lanes.destroyProjectLane("awraq", "main", true); }
      catch (error) { mainDestroyError = error.message; }
      console.log(JSON.stringify({ main, task, mainDestroyError, statuses: await lanes.listProjectLaneStatuses("awraq") }));
    `;
    const result = await execa("bun", ["--eval", script], { env: environment });
    const output = JSON.parse(result.stdout) as {
      main: { id: string; number: number; kind: string };
      task: { id: string; number: number; kind: string };
      mainDestroyError: string;
      statuses: Array<{ lane: { id: string } }>;
    };

    expect(output.main).toMatchObject({ id: "main", number: 0, kind: "canonical" });
    expect(output.task).toMatchObject({ id: "excel-tree-import", number: 1, kind: "task" });
    expect(output.mainDestroyError).toBe("The canonical main environment cannot be destroyed");
    expect(output.statuses.map(({ lane }) => lane.id)).toEqual(["main"]);
    expect(readFileSync(logPath, "utf8").trim().split("\n")).toEqual([
      "setup",
      "verify",
      "setup",
      "verify",
      "destroy",
    ]);
    expect(existsSync(taskRoot)).toBe(true);
    expect(readFileSync(statePath, "utf8")).not.toContain("excel-tree-import");
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
