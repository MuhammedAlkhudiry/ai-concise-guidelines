import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function sessionEvents(id: string, inputTokens: number): string {
  return [
    {
      type: "session_meta",
      payload: {
        id,
        cwd: "/projects/example",
        base_instructions: { text: "base" },
      },
    },
    { type: "turn_context", payload: { user_instructions: "project" } },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Build the example" }],
      },
    },
    {
      type: "event_msg",
      payload: {
        type: "token_count",
        info: {
          last_token_usage: {
            input_tokens: inputTokens,
            cached_input_tokens: 0,
            output_tokens: 10,
          },
        },
      },
    },
  ]
    .map((event) => JSON.stringify(event))
    .join("\n");
}

test("aggregates descendant context by root task tree", () => {
  const directory = mkdtempSync(join(tmpdir(), "codex-context-audit-"));
  temporaryDirectories.push(directory);
  const sessionsRoot = join(directory, "sessions");
  mkdirSync(sessionsRoot, { recursive: true });
  writeFileSync(join(sessionsRoot, "rollout-root.jsonl"), sessionEvents("root", 30_000));
  writeFileSync(join(sessionsRoot, "rollout-child.jsonl"), sessionEvents("child", 60_000));

  const stateDb = join(directory, "state.sqlite");
  const database = new Database(stateDb);
  database.run(
    "CREATE TABLE threads (id TEXT PRIMARY KEY, title TEXT, cwd TEXT, first_user_message TEXT)",
  );
  database.run(
    "CREATE TABLE thread_spawn_edges (parent_thread_id TEXT, child_thread_id TEXT PRIMARY KEY)",
  );
  database.run(
    "INSERT INTO threads VALUES ('root', 'Build example tree', '/projects/example', 'Build the example')",
  );
  database.run(
    "INSERT INTO threads VALUES ('child', 'Child task', '/projects/example', 'Build the example')",
  );
  database.run("INSERT INTO thread_spawn_edges VALUES ('root', 'child')");
  database.close();

  const result = Bun.spawnSync([
    "bun",
    join(import.meta.dir, "analyze-codex-sessions.ts"),
    "--root",
    sessionsRoot,
    "--since",
    "2020-01-01",
    "--state-db",
    stateDb,
    "--limit",
    "5",
  ]);
  const output = result.stdout.toString();

  expect(result.exitCode).toBe(0);
  expect(output).toContain("## Largest Task Trees");
  expect(output).toContain("Build example tree");
  expect(output).toMatch(/90,000\s+\| 2\s+\| 1\s+\| 1\s+\| 1\s+\| 1/);
});
