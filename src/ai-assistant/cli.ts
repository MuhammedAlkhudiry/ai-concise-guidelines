#!/usr/bin/env bun

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

import pc from "picocolors";

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
  lastNotifiedAt?: string;
  consecutiveDigestFailures?: number;
  digestStoppedAt?: string;
  lastFailureReason?: string;
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
const MAX_CONSECUTIVE_FAILURES = 3;
const LAST_DIGEST_MESSAGE = join(STATE_DIR, "last-digest-message.md");
const AI_PROMPT_FILE = "🤖 ai/🧠 ai-prompt.md";
const FEEDBACK_FILE = "🤖 ai/📡 ai-feedback.md";
const INBOX_FILE = "📥 inbox/📥 inbox.md";
const INBOX_FOLDER = "📥 inbox";
const VAULT_NAME = "muhammed";
const CODEX_REASONING_EFFORT = "medium";
const NTFY_HOST = "ntfy.sh";
const NTFY_TOPIC = "ai-assistant-993ea5c4212b4562837fb9f12e955b69";
const NTFY_TIMEOUT_MS = 10_000;
const OBSIDIAN_TIMEOUT_MS = 30_000;
const CODEX_TIMEOUT_MS = 30 * 60_000;
const color = pc.createColors(
  process.env.AI_ASSISTANT_COLOR === "1" || (!process.env.NO_COLOR && pc.isColorSupported),
);

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

function info(message: string): void {
  log(color.blue(message));
}

function success(message: string): void {
  log(color.green(message));
}

function warning(message: string): void {
  console.error(color.yellow(`warning: ${message}`));
}

function printTitle(title: string): void {
  const width = Math.max(42, title.length + 8);
  log("");
  log(color.cyan(`+${"=".repeat(width)}+`));
  log(color.cyan(`|   ${color.bold(title)}${" ".repeat(width - title.length - 5)}|`));
  log(color.cyan(`+${"=".repeat(width)}+`));
}

function printSection(title: string): void {
  log("");
  log(color.bold(color.blue(title)));
}

function printRow(label: string, value: string | number): void {
  log(`  ${color.dim(label.padEnd(24))}${value}`);
}

function statusValue(value: string): string {
  switch (value) {
    case "done":
    case "idle":
    case "loaded":
      return color.green(value);
    case "running":
    case "waiting-for-stability":
      return color.blue(value);
    case "failed":
    case "stopped-after-failures":
    case "missing":
    case "not loaded":
    case "not installed":
      return color.red(value);
    default:
      return color.yellow(value);
  }
}

function fatal(message: string): never {
  console.error(color.red(`error: ${message}`));
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
  printTitle("ai-assistant");
  log(`Usage: ${color.bold("ai-assistant <command>")}

Commands:
  ${color.green("digest".padEnd(12))}Run the main agent after the inbox is stable for 5 minutes. Pass --force to skip waiting.
  ${color.green("install".padEnd(12))}Install and load the LaunchAgent that checks the inbox every minute.
  ${color.green("uninstall".padEnd(12))}Unload and remove the LaunchAgent.
  ${color.green("status".padEnd(12))}Show vault, state, lock, and LaunchAgent status.
  ${color.green("notify-test".padEnd(12))}Send a test Mac and ntfy notification to the fixed topic.
  ${color.green("logs".padEnd(12))}Print recent main-agent logs. Pass -f to follow.`);
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

async function run(
  command: string,
  args: string[],
  options: RunOptions = {},
): Promise<CommandResult> {
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
          stderr:
            `${stderr.trim()}\n${command} timed out after ${Math.round((options.timeoutMs || 0) / 1000)}s`.trim(),
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

  const vaultDir = await runOk("obsidian", ["vault", "info=path"], {
    timeoutMs: OBSIDIAN_TIMEOUT_MS,
  });
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

async function patchState(
  updates: Partial<AssistantState>,
  deleteKeys: Array<keyof AssistantState> = [],
): Promise<void> {
  const state = await readState();
  for (const key of deleteKeys) {
    delete state[key];
  }
  await writeState({ ...state, ...updates });
}

async function resetDigestFailures(): Promise<void> {
  await patchState({ consecutiveDigestFailures: 0 }, [
    "failedAt",
    "digestStoppedAt",
    "lastFailureReason",
  ]);
}

async function computeInboxHash(): Promise<string> {
  const inbox = await run("obsidian", ["read", `path=${INBOX_FILE}`], {
    timeoutMs: OBSIDIAN_TIMEOUT_MS,
  });
  const files = await run("obsidian", ["files", `folder=${INBOX_FOLDER}`], {
    timeoutMs: OBSIDIAN_TIMEOUT_MS,
  });

  if (inbox.status) {
    throw new Error(inbox.stderr.trim() || `Failed to read ${INBOX_FILE}`);
  }
  if (files.status) {
    throw new Error(files.stderr.trim() || `Failed to list ${INBOX_FOLDER} files`);
  }

  const sortedFiles = files.stdout.split(/\r?\n/).filter(Boolean).sort().join("\n");

  const hash = createHash("sha256");
  hash.update(`FILE ${INBOX_FILE}\n`);
  hash.update(inbox.stdout);
  hash.update(`\nFILES ${INBOX_FOLDER}\n`);
  hash.update(sortedFiles);
  hash.update("\n");

  return hash.digest("hex");
}

function obsidianContent(content: string): string {
  return content.replaceAll("\n", "\\n");
}

async function overwriteVaultFile(path: string, content: string): Promise<void> {
  const result = await run(
    "obsidian",
    ["create", `path=${path}`, `content=${obsidianContent(content)}`, "overwrite"],
    {
      timeoutMs: OBSIDIAN_TIMEOUT_MS,
    },
  );
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
    warning(`could not update ${FEEDBACK_FILE}: ${(error as Error).message}`);
  }
}

function ntfySubscribeUrl(topic: string): string {
  return `https://${NTFY_HOST}/${topic}`;
}

function ntfyDeepLink(topic: string): string {
  return `ntfy://${NTFY_HOST}/${topic}?display=AI+Assistant`;
}

async function notifyMac(title: string, message: string): Promise<void> {
  const result = await run(
    "osascript",
    [
      "-e",
      "on run argv",
      "-e",
      "display notification (item 2 of argv) with title (item 1 of argv)",
      "-e",
      "end run",
      title,
      message,
    ],
    { timeoutMs: NTFY_TIMEOUT_MS },
  );

  if (result.status) {
    throw new Error(result.stderr.trim() || "macOS notification failed");
  }
}

async function notifyNtfy(title: string, message: string): Promise<string> {
  const response = await fetch(ntfySubscribeUrl(NTFY_TOPIC), {
    method: "POST",
    body: message,
    headers: {
      Title: title,
      Priority: "default",
    },
    signal: AbortSignal.timeout(NTFY_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`ntfy returned HTTP ${response.status}`);
  }

  return NTFY_TOPIC;
}

async function notify(title: string, message: string): Promise<void> {
  let sent = false;

  try {
    await notifyMac(title, message);
    sent = true;
  } catch (error) {
    warning(`macOS notification failed: ${(error as Error).message}`);
  }

  try {
    await notifyNtfy(title, message);
    sent = true;
  } catch (error) {
    warning(`ntfy notification failed: ${(error as Error).message}`);
  }

  if (sent) {
    await patchState({ lastNotifiedAt: nowIso() });
  }
}

async function notifyTest(): Promise<void> {
  await ensureStateDirs();
  await notify("AI Assistant", "Notification test from ai-assistant.");

  printTitle("Notification Test");
  printRow("status", color.green("sent"));
  printRow("ntfy topic", NTFY_TOPIC);
  printRow("subscribe", ntfySubscribeUrl(NTFY_TOPIC));
  printRow("phone link", ntfyDeepLink(NTFY_TOPIC));
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
      info(`main agent already running with pid ${existingPid}`);
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
  return `Use the \`obsidian\` CLI.
Vault: \`${VAULT_NAME}\`.
Read and follow \`${AI_PROMPT_FILE}\`.`;
}

async function readLastDigestMessage(): Promise<string> {
  if (!existsSync(LAST_DIGEST_MESSAGE)) {
    return "";
  }

  return readFile(LAST_DIGEST_MESSAGE, "utf8");
}

async function runCodexDigest(): Promise<string> {
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
      "-c",
      `model_reasoning_effort="${CODEX_REASONING_EFFORT}"`,
      "--output-last-message",
      LAST_DIGEST_MESSAGE,
      digestPrompt(),
    ],
    { inherit: true, timeoutMs: CODEX_TIMEOUT_MS },
  );

  if (result.status) {
    throw new Error(result.stderr.trim() || "Codex main-agent run failed.");
  }

  const message = await readLastDigestMessage();
  if (/unable to find Obsidian|cannot proceed|can't proceed|please open Obsidian/i.test(message)) {
    process.stderr.write(message);
    throw new Error("Codex main-agent run could not access Obsidian.");
  }

  return message;
}

async function digest(args: string[] = []): Promise<void> {
  const release = await acquireLock();

  try {
    requireTool("bun", `Bun is needed to run ${APP_NAME}.`);
    const existingState = await readState();
    if (existingState.digestStoppedAt) {
      warning(
        `main agent stopped after ${existingState.consecutiveDigestFailures || MAX_CONSECUTIVE_FAILURES} consecutive failures`,
      );
      return;
    }

    await vaultPath();

    const currentHash = await computeInboxHash();
    const state = await readState();
    const nowEpoch = Math.floor(Date.now() / 1000);
    const force = args.includes("--force");

    if (currentHash !== state.inboxHash && !force) {
      await patchState({
        inboxHash: currentHash,
        changedAt: nowIso(),
        changedAtEpoch: String(nowEpoch),
        lastStatus: "waiting-for-stability",
      });
      await publishFeedback("Waiting", [
        "Inbox changed. I will run the main agent after it stays unchanged for 5 minutes.",
        "You can keep editing from Mac, Android, or iOS; the timer resets when the synced inbox changes.",
      ]);
      info(`inbox changed; waiting ${STABLE_SECONDS}s before main-agent run`);
      return;
    }

    if (currentHash !== state.inboxHash) {
      await patchState({
        inboxHash: currentHash,
        changedAt: nowIso(),
        changedAtEpoch: String(nowEpoch),
      });
      info("force requested; skipping stability wait");
    }

    if (currentHash === state.lastDigestedHash && !force) {
      await patchState({ lastStatus: "idle", checkedAt: nowIso(), consecutiveDigestFailures: 0 }, [
        "failedAt",
        "lastFailureReason",
      ]);
      success("inbox already handled");
      return;
    }

    if (currentHash === state.lastDigestedHash) {
      info("force requested; running main agent on already-handled inbox");
    }

    const changedAtEpoch = Number(state.changedAtEpoch || 0);
    const ageSeconds = nowEpoch - changedAtEpoch;

    if (ageSeconds < STABLE_SECONDS && !force) {
      await patchState({ lastStatus: "waiting-for-stability", checkedAt: nowIso() });
      info(`inbox stable for ${ageSeconds}s; waiting until ${STABLE_SECONDS}s`);
      return;
    }

    await patchState({ lastStatus: "running", startedAt: nowIso() });
    await publishFeedback("Running", [
      "Inbox stayed unchanged for 5 minutes. Main agent started.",
      "The AI will decide whether the finish notification is useful and what it should say.",
    ]);

    try {
      await runCodexDigest();
    } catch (error) {
      const failureReason = (error as Error).message;
      const latestState = await readState();
      const failureCount = (latestState.consecutiveDigestFailures || 0) + 1;
      const updates: Partial<AssistantState> = {
        lastStatus: "failed",
        failedAt: nowIso(),
        consecutiveDigestFailures: failureCount,
        lastFailureReason: failureReason,
      };

      if (failureCount >= MAX_CONSECUTIVE_FAILURES) {
        updates.lastStatus = "stopped-after-failures";
        updates.digestStoppedAt = nowIso();
      }

      await patchState(updates);

      if (failureCount >= MAX_CONSECUTIVE_FAILURES) {
        await publishFeedback("Stopped", [
          `Main agent failed ${failureCount} times in a row and has stopped.`,
          "The inbox was left in place so nothing is silently lost.",
          "Fix the failure, then run `mise run install` or `ai-assistant install` to start it again.",
        ]);
        await notify("AI Assistant", "Main agent stopped after 3 consecutive failures.");
        stopLaunchAgentSoon();
      } else {
        await publishFeedback("Failed", [
          `Main agent failed ${failureCount}/${MAX_CONSECUTIVE_FAILURES} times in a row.`,
          "The inbox was left in place so nothing is silently lost.",
        ]);
        await notify(
          "AI Assistant",
          `Main agent failed ${failureCount}/${MAX_CONSECUTIVE_FAILURES}. Inbox was left in place.`,
        );
      }

      throw error;
    }

    const postHash = await computeInboxHash();
    await patchState(
      {
        inboxHash: postHash,
        lastDigestedHash: postHash,
        lastDigestedAt: nowIso(),
        lastStatus: "done",
        consecutiveDigestFailures: 0,
      },
      ["failedAt", "digestStoppedAt", "lastFailureReason"],
    );
    await publishFeedback("Done", ["Main agent completed."]);
    success("main agent completed");
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

function stopLaunchAgentSoon(): void {
  const script = `sleep 2; launchctl bootout ${JSON.stringify(launchAgentDomain())} ${JSON.stringify(LAUNCH_AGENT_PLIST)} >/dev/null 2>&1`;
  const child = spawn("sh", ["-c", script], {
    detached: true,
    stdio: "ignore",
  });

  child.unref();
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
    fatal(
      `${commandFile} is missing. Run mise run install from the ai-concise-guidelines repo first.`,
    );
  }

  const plistContent = launchAgentPlistContent(commandFile);
  await resetDigestFailures();

  if (
    existsSync(LAUNCH_AGENT_PLIST) &&
    readFileSync(LAUNCH_AGENT_PLIST, "utf8") === plistContent &&
    (await launchAgentLoaded())
  ) {
    success(`${LAUNCH_AGENT_LABEL} already installed`);
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

  printTitle("LaunchAgent Installed");
  printRow("label", LAUNCH_AGENT_LABEL);
  printRow("logs", LOG_DIR);
}

async function uninstallLaunchAgent(): Promise<void> {
  await run("launchctl", ["bootout", launchAgentDomain(), LAUNCH_AGENT_PLIST]);
  await rm(LAUNCH_AGENT_PLIST, { force: true });
  success(`removed ${LAUNCH_AGENT_LABEL}`);
}

async function status(): Promise<void> {
  await ensureStateDirs();

  printTitle(APP_NAME);
  printSection("Local State");
  printRow("state file", STATE_FILE);

  const obsidianPath = commandPath("obsidian");
  printSection("Tools");
  if (obsidianPath) {
    printRow("obsidian", `${color.green("ok")} ${obsidianPath}`);
    try {
      printRow("vault", await vaultPath());
    } catch (error) {
      printRow("vault", color.red((error as Error).message));
    }
  } else {
    printRow("obsidian", statusValue("missing"));
  }

  const codexPath = commandPath("codex");
  printRow("codex", codexPath ? `${color.green("ok")} ${codexPath}` : statusValue("missing"));

  printSection("Main Agent");
  if (existsSync(STATE_FILE)) {
    const state = await readState();
    printRow("last status", statusValue(state.lastStatus || "unknown"));
    printRow("changed at", state.changedAt || color.dim("none"));
    printRow("last digested at", state.lastDigestedAt || color.dim("none"));
    printRow("last feedback at", state.lastFeedbackAt || color.dim("none"));
    printRow("last notified at", state.lastNotifiedAt || color.dim("none"));
    printRow("failure count", state.consecutiveDigestFailures || 0);
    printRow("stopped at", state.digestStoppedAt || color.dim("none"));
    printRow("last failure", state.lastFailureReason || color.dim("none"));
  } else {
    printRow("state file", statusValue("missing"));
  }

  printSection("Notifications");
  printRow("ntfy topic", NTFY_TOPIC);
  printRow("subscribe", ntfySubscribeUrl(NTFY_TOPIC));
  printRow("phone link", ntfyDeepLink(NTFY_TOPIC));
  printRow("feedback file", FEEDBACK_FILE);

  printSection("Runtime");
  if (existsSync(LOCK_DIR)) {
    const pidFile = join(LOCK_DIR, "pid");
    const pid = existsSync(pidFile) ? readFileSync(pidFile, "utf8").trim() : "";
    printRow("lock", color.yellow(`present pid=${pid}`));
  } else {
    printRow("lock", color.green("none"));
  }

  if (existsSync(LAUNCH_AGENT_PLIST)) {
    printRow("launch agent", LAUNCH_AGENT_PLIST);
    printRow("launch status", statusValue((await launchAgentLoaded()) ? "loaded" : "not loaded"));
  } else {
    printRow("launch agent", statusValue("not installed"));
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
      await digest(args);
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
    case "notify-test":
      await notifyTest();
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
  console.error(color.red(`error: ${error.message}`));
  process.exit(1);
});
