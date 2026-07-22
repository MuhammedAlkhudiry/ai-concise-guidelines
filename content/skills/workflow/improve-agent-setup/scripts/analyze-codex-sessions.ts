#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { Database } from "bun:sqlite";

type JsonObject = Record<string, unknown>;

type SessionSummary = {
  file: string;
  id: string;
  cwd: string;
  bytes: number;
  lines: number;
  tokenEvents: number;
  compactions: number;
  sessionMetaCount: number;
  turnContextCount: number;
  firstInput: number;
  maxInput: number;
  totalInput: number;
  cachedInput: number;
  totalOutput: number;
  baseInstructionBytes: number;
  userInstructionBytes: number;
  firstUserMessage: string;
  imageMessages: number;
  imageBytes: number;
  execOutputs: number;
  largeExecOutputs: number;
  truncatedOutputs: number;
};

type CommandSummary = {
  command: string;
  count: number;
  bytes: number;
  originalTokens: number;
  truncated: number;
};

type TaskTreeSummary = {
  rootId: string;
  title: string;
  cwd: string;
  sessions: number;
  descendants: number;
  maxDepth: number;
  totalInput: number;
  repeatedRootRequest: number;
  highStartupDescendants: number;
};

const home = process.env.HOME || "";
const args = new Map<string, string>();

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage:
  analyze-codex-sessions.ts [options]

Options:
  --root <path>         Session root. Default: ~/.codex/sessions.
  --days <number>       Lookback window when --since is absent. Default: 14.
  --limit <number>      Maximum ranked items per section. Default: 12.
  --cwd <path>          Include only sessions for this working directory.
  --since <date>        Include sessions modified on or after this date.
  --since-mtime <time>  Include sessions modified after this epoch time.
  --state-db <path>     Codex state database. Default: ~/.codex/state_5.sqlite.`);
  process.exit(0);
}

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;

  const [key, inlineValue] = arg.slice(2).split("=", 2);
  const value = inlineValue ?? process.argv[i + 1];
  args.set(key, value);

  if (!inlineValue) i++;
}

const root = args.get("root") || join(home, ".codex", "sessions");
const days = Number(args.get("days") || 14);
const limit = Number(args.get("limit") || 12);
const cwdFilter = args.get("cwd");
const stateDbPath = args.get("state-db") || join(home, ".codex", "state_5.sqlite");
const since = resolveSince();

function resolveSince(): number {
  const sinceMtime = args.get("since-mtime");
  if (sinceMtime) {
    const value = Number(sinceMtime);
    if (!Number.isNaN(value)) {
      return value > 10_000_000_000 ? value : value * 1000;
    }
  }

  const sinceDate = args.get("since");
  if (sinceDate) {
    const value = Date.parse(sinceDate);
    if (!Number.isNaN(value)) {
      return value;
    }
  }

  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function walk(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...walk(path));
      continue;
    }

    if (entry.startsWith("rollout-") && entry.endsWith(".jsonl") && stat.mtimeMs >= since) {
      files.push(path);
    }
  }

  return files.sort();
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function messageText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((item) => {
      const content = asObject(item);
      return asString(content.text) || asString(content.input_text);
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function byteLength(value: string): number {
  return Buffer.byteLength(value);
}

function approxTokens(bytes: number): number {
  return Math.round(bytes / 4);
}

function shortText(value: string, limit = 72): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
}

function normalizePath(path: string): string {
  const expandedPath = path.startsWith("~/") ? join(home, path.slice(2)) : path;
  return resolve(expandedPath).replace(/\/+$/, "");
}

function matchesCwd(cwd: string): boolean {
  if (!cwdFilter) {
    return true;
  }

  const normalizedCwd = normalizePath(cwd);
  const normalizedFilter = normalizePath(cwdFilter);
  return normalizedCwd === normalizedFilter || normalizedCwd.startsWith(`${normalizedFilter}/`);
}

function addCommand(
  commands: Map<string, CommandSummary>,
  command: string,
  bytes: number,
  originalTokens: number,
  truncated: boolean,
): void {
  const existing = commands.get(command) || {
    command,
    count: 0,
    bytes: 0,
    originalTokens: 0,
    truncated: 0,
  };

  existing.count++;
  existing.bytes += bytes;
  existing.originalTokens += originalTokens;
  if (truncated) existing.truncated++;
  commands.set(command, existing);
}

function shortCommand(argsJson: string): string {
  try {
    const parsed = JSON.parse(argsJson) as { cmd?: string };
    const command = parsed.cmd || "(no command)";
    return command.split(/\s+/).slice(0, 6).join(" ");
  } catch {
    return "(unparsed command)";
  }
}

function printTable<T>(items: T[], columns: Array<[string, (item: T) => string | number]>): void {
  const rows = items.map((item) => columns.map(([, get]) => String(get(item))));
  const widths = columns.map(([header], index) =>
    Math.max(header.length, ...rows.map((row) => row[index].length)),
  );

  console.log(`| ${columns.map(([header], index) => header.padEnd(widths[index])).join(" | ")} |`);
  console.log(`| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`);

  for (const row of rows) {
    console.log(`| ${row.map((cell, index) => cell.padEnd(widths[index])).join(" | ")} |`);
  }
}

function loadTaskTrees(sessions: SessionSummary[]): TaskTreeSummary[] {
  if (!existsSync(stateDbPath) || sessions.length === 0) return [];

  const database = new Database(stateDbPath, { readonly: true });
  try {
    const threads = database
      .query("SELECT id, title, cwd, first_user_message FROM threads")
      .all() as Array<{ id: string; title: string; cwd: string; first_user_message: string }>;
    const edges = database
      .query("SELECT parent_thread_id, child_thread_id FROM thread_spawn_edges")
      .all() as Array<{ parent_thread_id: string; child_thread_id: string }>;
    const threadById = new Map(threads.map((thread) => [thread.id, thread]));
    const parentByChild = new Map(
      edges.map(({ parent_thread_id, child_thread_id }) => [child_thread_id, parent_thread_id]),
    );
    const sessionById = new Map(
      sessions.filter(({ id }) => id).map((session) => [session.id, session]),
    );
    const groups = new Map<
      string,
      Array<{ session: SessionSummary; depth: number; request: string }>
    >();

    for (const session of sessionById.values()) {
      let rootId = session.id;
      let depth = 0;
      const visited = new Set<string>();

      while (parentByChild.has(rootId) && !visited.has(rootId)) {
        visited.add(rootId);
        rootId = parentByChild.get(rootId) || rootId;
        depth++;
      }

      const request = threadById.get(session.id)?.first_user_message || session.firstUserMessage;
      const members = groups.get(rootId) || [];
      members.push({ session, depth, request });
      groups.set(rootId, members);
    }

    return Array.from(groups.entries())
      .map(([rootId, members]): TaskTreeSummary => {
        const rootThread = threadById.get(rootId);
        const rootRequest =
          rootThread?.first_user_message || members.find(({ depth }) => depth === 0)?.request || "";
        const descendants = members.filter(({ depth }) => depth > 0);
        return {
          rootId,
          title: rootThread?.title || rootRequest || rootId,
          cwd: rootThread?.cwd || members[0]?.session.cwd || "",
          sessions: members.length,
          descendants: descendants.length,
          maxDepth: Math.max(...members.map(({ depth }) => depth)),
          totalInput: members.reduce((sum, { session }) => sum + session.totalInput, 0),
          repeatedRootRequest: descendants.filter(({ request }) => request === rootRequest).length,
          highStartupDescendants: descendants.filter(({ session }) => session.firstInput >= 50_000)
            .length,
        };
      })
      .filter(({ descendants }) => descendants > 0)
      .sort((a, b) => b.totalInput - a.totalInput);
  } finally {
    database.close();
  }
}

if (!existsSync(root)) {
  console.error(`Codex sessions directory not found: ${root}`);
  process.exit(1);
}

const files = walk(root);
const commands = new Map<string, CommandSummary>();
const sessions: SessionSummary[] = [];
let totalLines = 0;
let totalParsed = 0;

for (const file of files) {
  const summary: SessionSummary = {
    file: relative(root, file),
    id: "",
    cwd: "",
    bytes: 0,
    lines: 0,
    tokenEvents: 0,
    compactions: 0,
    sessionMetaCount: 0,
    turnContextCount: 0,
    firstInput: 0,
    maxInput: 0,
    totalInput: 0,
    cachedInput: 0,
    totalOutput: 0,
    baseInstructionBytes: 0,
    userInstructionBytes: 0,
    firstUserMessage: "",
    imageMessages: 0,
    imageBytes: 0,
    execOutputs: 0,
    largeExecOutputs: 0,
    truncatedOutputs: 0,
  };
  const calls = new Map<string, { name: string; command: string }>();
  const sessionCommands = new Map<string, CommandSummary>();
  let sessionParsed = 0;

  for (const line of readFileSync(file, "utf-8").split(/\n/)) {
    if (!line) continue;

    summary.lines++;
    summary.bytes += byteLength(line);

    let event: JsonObject;
    try {
      event = JSON.parse(line) as JsonObject;
    } catch {
      continue;
    }

    sessionParsed++;
    const type = asString(event.type);
    const payload = asObject(event.payload);

    if (type === "session_meta") {
      summary.sessionMetaCount++;
      summary.id = asString(asObject(payload).id) || summary.id;
      summary.cwd = asString(payload.cwd) || summary.cwd;
      if (!summary.baseInstructionBytes) {
        summary.baseInstructionBytes = byteLength(
          asString(asObject(payload.base_instructions).text),
        );
      }
    }

    if (type === "turn_context") {
      summary.turnContextCount++;
      if (!summary.userInstructionBytes) {
        summary.userInstructionBytes = byteLength(asString(payload.user_instructions));
      }
    }

    if (type === "compacted") {
      summary.compactions++;
    }

    if (type === "event_msg" && payload.type === "token_count") {
      const info = asObject(payload.info);
      const lastUsage = asObject(info.last_token_usage);

      const inputTokens = asNumber(lastUsage.input_tokens);
      summary.tokenEvents++;
      summary.totalInput += inputTokens;
      summary.cachedInput += asNumber(lastUsage.cached_input_tokens);
      summary.totalOutput += asNumber(lastUsage.output_tokens);
      summary.maxInput = Math.max(summary.maxInput, inputTokens);
      if (!summary.firstInput) summary.firstInput = inputTokens;
    }

    if (type === "response_item" && payload.type === "message" && payload.role === "user") {
      if (!summary.firstUserMessage) {
        summary.firstUserMessage = messageText(payload.content);
      }
      const content = JSON.stringify(payload.content || "");

      if (content.includes("data:image")) {
        summary.imageMessages++;
        summary.imageBytes += byteLength(content);
      }
    }

    if (type === "response_item" && payload.type === "function_call") {
      const callId = asString(payload.call_id);
      const name = asString(payload.name);
      const command = name === "exec_command" ? shortCommand(asString(payload.arguments)) : name;

      if (callId) calls.set(callId, { name, command });
    }

    if (type === "response_item" && payload.type === "function_call_output") {
      const call = calls.get(asString(payload.call_id));
      if (!call || call.name !== "exec_command") continue;

      const output = asString(payload.output);
      const bytes = byteLength(output);
      const originalTokens = Number(output.match(/Original token count: (\d+)/)?.[1] || 0);
      const truncated = output.includes("tokens truncated") || output.includes("truncated");

      summary.execOutputs++;
      if (originalTokens > 1000) summary.largeExecOutputs++;
      if (truncated) summary.truncatedOutputs++;
      addCommand(sessionCommands, call.command, bytes, originalTokens, truncated);
    }
  }

  if (!matchesCwd(summary.cwd)) {
    continue;
  }

  totalLines += summary.lines;
  totalParsed += sessionParsed;
  sessions.push(summary);
  for (const command of sessionCommands.values()) {
    const existing = commands.get(command.command) || {
      command: command.command,
      count: 0,
      bytes: 0,
      originalTokens: 0,
      truncated: 0,
    };
    existing.count += command.count;
    existing.bytes += command.bytes;
    existing.originalTokens += command.originalTokens;
    existing.truncated += command.truncated;
    commands.set(command.command, existing);
  }
}

const totalBytes = sessions.reduce((sum, session) => sum + session.bytes, 0);
const totalInput = sessions.reduce((sum, session) => sum + session.totalInput, 0);
const cachedInput = sessions.reduce((sum, session) => sum + session.cachedInput, 0);
const compactions = sessions.reduce((sum, session) => sum + session.compactions, 0);
const images = sessions.reduce((sum, session) => sum + session.imageMessages, 0);
const imageBytes = sessions.reduce((sum, session) => sum + session.imageBytes, 0);
const execOutputs = sessions.reduce((sum, session) => sum + session.execOutputs, 0);
const largeExecOutputs = sessions.reduce((sum, session) => sum + session.largeExecOutputs, 0);
const truncatedOutputs = sessions.reduce((sum, session) => sum + session.truncatedOutputs, 0);
const firstInputs = sessions
  .filter((session) => session.firstInput > 0)
  .map((session) => session.firstInput);
const averageFirstInput = firstInputs.length
  ? Math.round(firstInputs.reduce((sum, value) => sum + value, 0) / firstInputs.length)
  : 0;
let taskTrees: TaskTreeSummary[] = [];
let taskTreeError = "";
try {
  taskTrees = loadTaskTrees(sessions);
} catch (error) {
  taskTreeError = error instanceof Error ? error.message : String(error);
}

console.log(`# Codex Session Context Audit\n`);
console.log(
  `Window: ${
    args.has("since") || args.has("since-mtime")
      ? `since ${new Date(since).toISOString()}`
      : `last ${days} days`
  }`,
);
if (cwdFilter) {
  console.log(`CWD filter: ${normalizePath(cwdFilter).replace(home, "~")}`);
}
console.log(`Files: ${sessions.length}/${files.length}`);
console.log(`Parsed events: ${totalParsed}/${totalLines}`);
console.log(`Stored session text: ~${approxTokens(totalBytes).toLocaleString()} tokens`);
console.log(`Average first request input: ${averageFirstInput.toLocaleString()} tokens`);
console.log(
  `Input cache rate: ${totalInput ? Math.round((cachedInput / totalInput) * 1000) / 10 : 0}%`,
);
console.log(`Compactions: ${compactions}`);
console.log(
  `Exec outputs: ${execOutputs.toLocaleString()} (${largeExecOutputs.toLocaleString()} over 1k original tokens, ${truncatedOutputs.toLocaleString()} truncated)`,
);
console.log(`Image messages: ${images} (~${approxTokens(imageBytes).toLocaleString()} tokens)\n`);

console.log(`## Largest Task Trees\n`);
if (taskTrees.length > 0) {
  printTable(taskTrees.slice(0, limit), [
    ["input", (item) => item.totalInput.toLocaleString()],
    ["sessions", (item) => item.sessions],
    ["desc", (item) => item.descendants],
    ["depth", (item) => item.maxDepth],
    ["repeat request", (item) => item.repeatedRootRequest],
    ["50k+ startup", (item) => item.highStartupDescendants],
    ["cwd", (item) => item.cwd.replace(home, "~")],
    ["root", (item) => shortText(item.title)],
  ]);
} else if (taskTreeError) {
  console.log(`Task-tree diagnostics unavailable: ${taskTreeError}`);
} else {
  console.log(`No multi-task trees detected in this window.`);
}

console.log(`\n## Largest Sessions\n`);
printTable(
  sessions
    .slice()
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit),
  [
    ["tokens", (item) => approxTokens(item.bytes).toLocaleString()],
    ["max input", (item) => item.maxInput.toLocaleString()],
    ["comp", (item) => item.compactions],
    ["images", (item) => item.imageMessages],
    ["large exec", (item) => item.largeExecOutputs],
    ["cwd", (item) => item.cwd.replace(home, "~")],
    ["file", (item) => item.file],
  ],
);

console.log(`\n## Noisiest Commands\n`);
printTable(
  Array.from(commands.values())
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit),
  [
    ["tokens", (item) => approxTokens(item.bytes).toLocaleString()],
    ["count", (item) => item.count],
    ["orig tokens", (item) => item.originalTokens.toLocaleString()],
    ["trunc", (item) => item.truncated],
    ["command", (item) => item.command],
  ],
);

console.log(`\n## Highest Startup Inputs\n`);
printTable(
  sessions
    .filter((session) => session.firstInput)
    .sort((a, b) => b.firstInput - a.firstInput)
    .slice(0, limit),
  [
    ["first input", (item) => item.firstInput.toLocaleString()],
    ["base", (item) => approxTokens(item.baseInstructionBytes).toLocaleString()],
    ["project", (item) => approxTokens(item.userInstructionBytes).toLocaleString()],
    ["request", (item) => approxTokens(byteLength(item.firstUserMessage)).toLocaleString()],
    [
      "runtime/history",
      (item) =>
        Math.max(
          0,
          item.firstInput -
            approxTokens(item.baseInstructionBytes) -
            approxTokens(item.userInstructionBytes) -
            approxTokens(byteLength(item.firstUserMessage)),
        ).toLocaleString(),
    ],
    ["cwd", (item) => item.cwd.replace(home, "~")],
    ["file", (item) => item.file],
  ],
);

console.log(`\n## Suggested Follow-Ups\n`);
if (truncatedOutputs || largeExecOutputs) {
  console.log(`- Replace broad shell exploration with narrower commands or purpose-built scripts.`);
}
if (images) {
  console.log(
    `- Prefer cropped screenshots, local image paths, or browser snapshots for visual QA.`,
  );
}
if (averageFirstInput > 20_000) {
  console.log(
    `- Review always-loaded rules, enabled tools, MCPs, and skill descriptions for startup bloat.`,
  );
}
if (taskTrees.some(({ highStartupDescendants }) => highStartupDescendants > 0)) {
  console.log(
    `- Give independent subagents no inherited turns and pass only the smallest explicit context needed.`,
  );
}
if (compactions) {
  console.log(
    `- Split long investigations sooner and preserve durable findings in source docs or memory.`,
  );
}
if (!truncatedOutputs && !largeExecOutputs && !images && !compactions) {
  console.log(`- No major context waste pattern detected in this window.`);
}
