#!/usr/bin/env bun

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

interface AssistantState {
  inboxHash?: string;
  changedAt?: string;
  changedAtEpoch?: string;
  lastStatus?: string;
  checkedAt?: string;
  startedAt?: string;
  failedAt?: string;
  lastDigestedHash?: string;
  lastDigestedAt?: string;
  lastFeedbackAt?: string;
}

interface CommandResult {
  status: number;
  stdout: string;
  stderr: string;
}

interface RunOptions {
  inherit?: boolean;
  timeoutMs?: number;
}

const HOME = process.env.HOME || homedir();
const APP_NAME = "ai-assistant";
const STATE_DIR = join(process.env.XDG_CONFIG_HOME || join(HOME, ".config"), APP_NAME);
const STATE_FILE = join(STATE_DIR, "state.json");
const LOCK_DIR = join(STATE_DIR, "run.lock");
const LOG_DIR = join(STATE_DIR, "logs");
const LAUNCH_AGENT_LABEL = "com.malkhudhari.ai-assistant.digest";
const LAUNCH_AGENT_PLIST = join(HOME, "Library", "LaunchAgents", `${LAUNCH_AGENT_LABEL}.plist`);
const STABLE_SECONDS = 300;
const LAST_DIGEST_MESSAGE = join(STATE_DIR, "last-digest-message.md");
const FEEDBACK_FILE = "ai-feedback.md";
const OBSIDIAN_TIMEOUT_MS = 30_000;
const CODEX_TIMEOUT_MS = 30 * 60_000;

function setupRuntimePath(): void {
  const pathParts = [
    join(HOME, ".local", "share", "mise", "shims"),
    join(HOME, ".bun", "bin"),
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ];

  process.env.PATH = [...pathParts, process.env.PATH || ""].filter(Boolean).join(":");
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function feedbackTime(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function log(message: string): void {
  console.log(message);
}

function fatal(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

async function ensureStateDirs(): Promise<void> {
  await mkdir(STATE_DIR, { recursive: true });
  await mkdir(LOG_DIR, { recursive: true });
}

function ensureStateDirsSync(): void {
  mkdirSync(STATE_DIR, { recursive: true });
  mkdirSync(LOG_DIR, { recursive: true });
}

function usage(): void {
  console.log(`Usage: ai-assistant <command>

Commands:
  digest      Check the inbox and run AI digestion after it is stable for 5 minutes.
  install     Install and load the LaunchAgent that runs digest every minute.
  uninstall   Unload and remove the LaunchAgent.
  status      Show vault, state, lock, and LaunchAgent status.
  logs        Print recent digest logs. Pass -f to follow.`);
}

function commandPath(command: string): string | null {
  const result = spawnSync("zsh", ["-lc", `command -v ${command}`], {
    encoding: "utf8",
    env: process.env,
  });

  if (result.status) {
    return null;
  }

  return result.stdout.trim() || null;
}

function requireTool(command: string, hint: string): void {
  if (!commandPath(command)) {
    fatal(`${command} is required. ${hint}`);
  }
}

async function run(command: string, args: string[], options: RunOptions = {}): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: options.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    if (!options.inherit) {
      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
    }

    let timedOut = false;
    let settled = false;
    let killTimer: ReturnType<typeof setTimeout> | undefined;
    const timeout = options.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGTERM");
          killTimer = setTimeout(() => child.kill("SIGKILL"), 5_000);
        }, options.timeoutMs)
      : undefined;

    const finish = (result: CommandResult): void => {
      if (settled) {
        return;
      }

      settled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      if (killTimer) {
        clearTimeout(killTimer);
      }
      resolve(result);
    };

    child.on("error", (error) => {
      finish({ status: 1, stdout, stderr: error.message });
    });
    child.on("close", (status) => {
      if (timedOut) {
        finish({
          status: 124,
          stdout,
          stderr: `${stderr.trim()}\n${command} timed out after ${Math.round((options.timeoutMs || 0) / 1000)}s`.trim(),
        });
        return;
      }

      finish({ status: status || 0, stdout, stderr });
    });
  });
}

async function runOk(command: string, args: string[], options: RunOptions = {}): Promise<string> {
  const result = await run(command, args, options);
  if (result.status) {
    throw new Error(result.stderr.trim() || `${command} ${args.join(" ")} failed`);
  }

  return result.stdout.trim();
}

async function vaultPath(): Promise<string> {
  requireTool("obsidian", "Install/configure the Obsidian CLI, then retry.");

  const vaultDir = await runOk("obsidian", ["vault", "info=path"], { timeoutMs: OBSIDIAN_TIMEOUT_MS });
  if (!vaultDir || !existsSync(vaultDir)) {
    throw new Error("Obsidian CLI could not resolve the active vault path.");
  }

  return vaultDir;
}

async function readState(): Promise<AssistantState> {
  if (!existsSync(STATE_FILE)) {
    return {};
  }

  try {
    return JSON.parse(await readFile(STATE_FILE, "utf8")) as AssistantState;
  } catch {
    return {};
  }
}

async function writeState(state: AssistantState): Promise<void> {
  await ensureStateDirs();
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function patchState(updates: Partial<AssistantState>, deleteKeys: Array<keyof AssistantState> = []): Promise<void> {
  const state = await readState();
  for (const key of deleteKeys) {
    delete state[key];
  }
  await writeState({ ...state, ...updates });
}

async function computeInboxHash(): Promise<string> {
  const inbox = await run("obsidian", ["read", "path=inbox/inbox.md"], { timeoutMs: OBSIDIAN_TIMEOUT_MS });
  const files = await run("obsidian", ["files", "folder=inbox"], { timeoutMs: OBSIDIAN_TIMEOUT_MS });

  if (inbox.status) {
    throw new Error(inbox.stderr.trim() || "Failed to read inbox/inbox.md");
  }
  if (files.status) {
    throw new Error(files.stderr.trim() || "Failed to list inbox files");
  }

  const sortedFiles = files.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .sort()
    .join("\n");

  const hash = createHash("sha256");
  hash.update("FILE inbox/inbox.md\n");
  hash.update(inbox.stdout);
  hash.update("\nFILES inbox\n");
  hash.update(sortedFiles);
  hash.update("\n");

  return hash.digest("hex");
}

function obsidianContent(content: string): string {
  return content.replaceAll("\n", "\\n");
}

async function overwriteVaultFile(path: string, content: string): Promise<void> {
  const result = await run("obsidian", ["create", `path=${path}`, `content=${obsidianContent(content)}`, "overwrite"], {
    timeoutMs: OBSIDIAN_TIMEOUT_MS,
  });
  if (result.status) {
    throw new Error(result.stderr.trim() || `Failed to update ${path}`);
  }
}

async function publishFeedback(status: string, body: string[]): Promise<void> {
  const content = [
    "# AI Feedback",
    "",
    `Last update: ${feedbackTime()}`,
    `Status: ${status}`,
    "",
    ...body,
    "",
    "From Mac, use `ai-assistant status` or `ai-assistant logs` for local details.",
    "",
  ].join("\n");

  try {
    await overwriteVaultFile(FEEDBACK_FILE, content);
    await patchState({ lastFeedbackAt: nowIso() });
  } catch (error) {
    console.error(`warning: could not update ${FEEDBACK_FILE}: ${(error as Error).message}`);
  }
}

function pidIsAlive(pid: string): boolean {
  if (!/^\d+$/.test(pid)) {
    return false;
  }

  try {
    process.kill(Number(pid), 0);
    return true;
  } catch {
    return false;
  }
}

async function acquireLock(): Promise<() => Promise<void>> {
  await ensureStateDirs();

  try {
    await mkdir(LOCK_DIR);
  } catch {
    const pidFile = join(LOCK_DIR, "pid");
    const existingPid = existsSync(pidFile) ? readFileSync(pidFile, "utf8").trim() : "";

    if (pidIsAlive(existingPid)) {
      log(`digest already running with pid ${existingPid}`);
      process.exit(0);
    }

    await rm(LOCK_DIR, { recursive: true, force: true });
    await mkdir(LOCK_DIR);
  }

  await writeFile(join(LOCK_DIR, "pid"), `${process.pid}\n`);
  await writeFile(join(LOCK_DIR, "started_at"), `${nowIso()}\n`);

  let released = false;
  const release = async (): Promise<void> => {
    if (released) {
      return;
    }

    released = true;
    await rm(LOCK_DIR, { recursive: true, force: true });
  };

  process.on("exit", () => {
    rmSync(LOCK_DIR, { recursive: true, force: true });
  });
  process.on("SIGINT", async () => {
    await release();
    process.exit(130);
  });
  process.on("SIGTERM", async () => {
    await release();
    process.exit(143);
  });

  return release;
}

function digestPrompt(): string {
  return `Use the _ai-assistant skill.

Background digest mode:
- Use the \`obsidian\` CLI for vault reads/writes.
- Do not read or write vault files directly; use \`obsidian read path=...\`, \`obsidian append path=...\`, \`obsidian create path=...\`, and related CLI commands.
- Confirm the active vault, then read \`ai-prompt.md\`.
- Read \`inbox/inbox.md\` and inspect inbox media.
- Process only clear entries.
- Append distilled content to the existing destination file.
- Clean only the digested source entries from \`inbox/inbox.md\`.
- If an entry is unclear, leave it in the inbox and do not guess.
- Do not write \`ai-feedback.md\`; the \`ai-assistant\` CLI publishes digest receipts after you finish.
- Do not print credential values.`;
}

async function runCodexDigest(): Promise<void> {
  requireTool("codex", "Install/configure the Codex CLI, then retry.");
  await rm(LAST_DIGEST_MESSAGE, { force: true });

  const result = await run(
    "codex",
    [
      "exec",
      "--cd",
      STATE_DIR,
      "--skip-git-repo-check",
      "--sandbox",
      "danger-full-access",
      "--output-last-message",
      LAST_DIGEST_MESSAGE,
      digestPrompt(),
    ],
    { inherit: true, timeoutMs: CODEX_TIMEOUT_MS }
  );

  if (result.status) {
    throw new Error(result.stderr.trim() || "Codex digest failed.");
  }

  if (existsSync(LAST_DIGEST_MESSAGE)) {
    const message = await readFile(LAST_DIGEST_MESSAGE, "utf8");
    if (/unable to find Obsidian|cannot proceed|can't proceed|please open Obsidian/i.test(message)) {
      process.stderr.write(message);
      throw new Error("Codex digest could not access Obsidian.");
    }
  }
}

async function digest(): Promise<void> {
  const release = await acquireLock();

  try {
    requireTool("bun", `Bun is needed to run ${APP_NAME}.`);
    await vaultPath();

    const currentHash = await computeInboxHash();
    const state = await readState();
    const nowEpoch = Math.floor(Date.now() / 1000);

    if (currentHash !== state.inboxHash) {
      await patchState({
        inboxHash: currentHash,
        changedAt: nowIso(),
        changedAtEpoch: String(nowEpoch),
        lastStatus: "waiting-for-stability",
      });
      await publishFeedback("Waiting", [
        "Inbox changed. I will digest it after it stays unchanged for 5 minutes.",
        "You can keep editing from Mac, Android, or iOS; the timer resets when the synced inbox changes.",
      ]);
      log(`inbox changed; waiting ${STABLE_SECONDS}s before digest`);
      return;
    }

    if (currentHash === state.lastDigestedHash) {
      await patchState({ lastStatus: "idle", checkedAt: nowIso() }, ["failedAt"]);
      log("inbox already digested");
      return;
    }

    const changedAtEpoch = Number(state.changedAtEpoch || 0);
    const ageSeconds = nowEpoch - changedAtEpoch;

    if (ageSeconds < STABLE_SECONDS) {
      await patchState({ lastStatus: "waiting-for-stability", checkedAt: nowIso() });
      log(`inbox stable for ${ageSeconds}s; waiting until ${STABLE_SECONDS}s`);
      return;
    }

    await patchState({ lastStatus: "running", startedAt: nowIso() });

    try {
      await runCodexDigest();
    } catch (error) {
      await patchState({ lastStatus: "failed", failedAt: nowIso() });
      await publishFeedback("Failed", [
        "Digest started but did not complete.",
        "The inbox was left in place so nothing is silently lost.",
      ]);
      throw error;
    }

    const postHash = await computeInboxHash();
    await patchState(
      {
        inboxHash: postHash,
        lastDigestedHash: postHash,
        lastDigestedAt: nowIso(),
        lastStatus: "done",
      },
      ["failedAt"]
    );
    await publishFeedback("Done", [
      "Digest completed after the inbox stayed unchanged for 5 minutes.",
      "Clear entries, if any, were moved to their destination files. Unclear entries stayed in `inbox/inbox.md`.",
    ]);
    log("digest completed");
  } finally {
    await release();
  }
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function launchAgentDomain(): string {
  const uid = process.getuid?.();
  if (typeof uid !== "number") {
    fatal("launchctl requires a macOS user session.");
  }

  return `gui/${uid}`;
}

function launchAgentTarget(): string {
  return `${launchAgentDomain()}/${LAUNCH_AGENT_LABEL}`;
}

function launchAgentPlistContent(commandFile: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${xmlEscape(LAUNCH_AGENT_LABEL)}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xmlEscape(commandFile)}</string>
    <string>digest</string>
  </array>
  <key>StartInterval</key>
  <integer>60</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${xmlEscape(join(LOG_DIR, "digest.out.log"))}</string>
  <key>StandardErrorPath</key>
  <string>${xmlEscape(join(LOG_DIR, "digest.err.log"))}</string>
</dict>
</plist>
`;
}

async function launchAgentLoaded(): Promise<boolean> {
  const result = await run("launchctl", ["print", launchAgentTarget()]);
  return !result.status;
}

async function installLaunchAgent(): Promise<void> {
  await ensureStateDirs();

  const commandFile = join(HOME, "bin", "ai-assistant");
  if (!existsSync(commandFile)) {
    fatal(`${commandFile} is missing. Run make install from the ai-concise-guidelines repo first.`);
  }

  const plistContent = launchAgentPlistContent(commandFile);
  if (existsSync(LAUNCH_AGENT_PLIST) && readFileSync(LAUNCH_AGENT_PLIST, "utf8") === plistContent && await launchAgentLoaded()) {
    log(`${LAUNCH_AGENT_LABEL} already installed`);
    return;
  }

  await mkdir(dirname(LAUNCH_AGENT_PLIST), { recursive: true });
  await writeFile(LAUNCH_AGENT_PLIST, plistContent);

  await run("launchctl", ["bootout", launchAgentDomain(), LAUNCH_AGENT_PLIST]);
  const bootstrap = await run("launchctl", ["bootstrap", launchAgentDomain(), LAUNCH_AGENT_PLIST]);
  if (bootstrap.status) {
    fatal(bootstrap.stderr.trim() || "launchctl bootstrap failed.");
  }

  await run("launchctl", ["enable", launchAgentTarget()]);

  log(`installed ${LAUNCH_AGENT_LABEL}`);
  log(`logs: ${LOG_DIR}`);
}

async function uninstallLaunchAgent(): Promise<void> {
  await run("launchctl", ["bootout", launchAgentDomain(), LAUNCH_AGENT_PLIST]);
  await rm(LAUNCH_AGENT_PLIST, { force: true });
  log(`removed ${LAUNCH_AGENT_LABEL}`);
}

async function status(): Promise<void> {
  await ensureStateDirs();

  log(APP_NAME);
  log(`state: ${STATE_FILE}`);

  const obsidianPath = commandPath("obsidian");
  if (obsidianPath) {
    log(`obsidian: ${obsidianPath}`);
    try {
      log(`vault: ${await vaultPath()}`);
    } catch (error) {
      log(`vault: ${(error as Error).message}`);
    }
  } else {
    log("obsidian: missing");
  }

  const codexPath = commandPath("codex");
  log(codexPath ? `codex: ${codexPath}` : "codex: missing");

  if (existsSync(STATE_FILE)) {
    const state = await readState();
    log(`lastStatus: ${state.lastStatus || "unknown"}`);
    log(`changedAt: ${state.changedAt || "none"}`);
    log(`lastDigestedAt: ${state.lastDigestedAt || "none"}`);
    log(`lastFeedbackAt: ${state.lastFeedbackAt || "none"}`);
  } else {
    log("state file: missing");
  }

  log(`feedback: ${FEEDBACK_FILE}`);

  if (existsSync(LOCK_DIR)) {
    const pidFile = join(LOCK_DIR, "pid");
    const pid = existsSync(pidFile) ? readFileSync(pidFile, "utf8").trim() : "";
    log(`lock: present pid=${pid}`);
  } else {
    log("lock: none");
  }

  if (existsSync(LAUNCH_AGENT_PLIST)) {
    log(`launch agent: ${LAUNCH_AGENT_PLIST}`);
    log(`launch agent status: ${await launchAgentLoaded() ? "loaded" : "not loaded"}`);
  } else {
    log("launch agent: not installed");
  }
}

async function logs(args: string[]): Promise<void> {
  ensureStateDirsSync();

  const outLog = join(LOG_DIR, "digest.out.log");
  const errLog = join(LOG_DIR, "digest.err.log");
  if (!existsSync(outLog)) {
    writeFileSync(outLog, "");
  }
  if (!existsSync(errLog)) {
    writeFileSync(errLog, "");
  }

  const tailArgs = ["-n", "100"];
  if (args[0] === "-f") {
    tailArgs.push("-f");
  }
  tailArgs.push(outLog, errLog);

  const result = await run("tail", tailArgs, { inherit: true });
  process.exitCode = result.status;
}

async function main(): Promise<void> {
  setupRuntimePath();

  const [command = "", ...args] = process.argv.slice(2);

  switch (command) {
    case "digest":
      await digest();
      break;
    case "install":
      await installLaunchAgent();
      break;
    case "uninstall":
      await uninstallLaunchAgent();
      break;
    case "status":
      await status();
      break;
    case "logs":
      await logs(args);
      break;
    case "":
    case "help":
    case "-h":
    case "--help":
      usage();
      break;
    default:
      usage();
      process.exitCode = 1;
  }
}

main().catch((error: Error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
