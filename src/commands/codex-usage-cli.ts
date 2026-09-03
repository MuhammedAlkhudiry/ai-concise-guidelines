#!/usr/bin/env bun

/**
 * Reads live Codex rate-limit usage from the signed-in account through `codex app-server`.
 */

const TIMEOUT_MS = 20_000;

interface UsageWindow {
  limitId: string;
  windowMinutes: number;
  usedPercent: number;
  resetsAt?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectWindows(value: unknown, limitId: string, found: UsageWindow[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectWindows(item, limitId, found);
    return;
  }
  if (!isRecord(value)) return;
  if (typeof value.usedPercent === "number" && typeof value.windowDurationMins === "number") {
    found.push({
      limitId,
      windowMinutes: value.windowDurationMins,
      usedPercent: value.usedPercent,
      resetsAt: typeof value.resetsAt === "number" ? value.resetsAt : undefined,
    });
    return;
  }
  for (const nested of Object.values(value)) collectWindows(nested, limitId, found);
}

function windowTitle(minutes: number): string {
  if (minutes === 10_080) return "Weekly";
  if (minutes % 1_440 === 0) return `${minutes / 1_440}-day`;
  if (minutes % 60 === 0) return `${minutes / 60}-hour`;
  return `${minutes}-minute`;
}

function formatReset(resetsAt: number | undefined): string {
  if (!resetsAt) return "reset unknown";
  const date = new Date(resetsAt * 1_000);
  return `resets ${date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`;
}

async function readRateLimits(): Promise<Record<string, unknown>> {
  const process_ = Bun.spawn(["codex", "app-server", "--stdio"], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  const send = (message: Record<string, unknown>): void => {
    process_.stdin.write(`${JSON.stringify(message)}\n`);
    process_.stdin.flush();
  };
  const reader = process_.stdout.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const timeout = setTimeout(() => process_.kill(), TIMEOUT_MS);

  try {
    send({
      method: "initialize",
      id: 1,
      params: { clientInfo: { name: "my-setup", title: "my-setup codex-usage", version: "1.0.0" } },
    });
    let initialized = false;
    while (true) {
      const { value, done } = await reader.read();
      if (done) throw new Error("codex app-server closed before returning rate limits");
      buffer += decoder.decode(value, { stream: true });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (!line) continue;
        let message: unknown;
        try {
          message = JSON.parse(line);
        } catch {
          continue;
        }
        if (!isRecord(message)) continue;
        if (message.id === 1 && !initialized) {
          if (message.error) throw new Error(`initialize failed: ${JSON.stringify(message.error)}`);
          initialized = true;
          send({ method: "initialized" });
          send({ method: "account/rateLimits/read", id: 2 });
          continue;
        }
        if (message.id === 2) {
          if (message.error) throw new Error(`rate limit read failed: ${JSON.stringify(message.error)}`);
          if (!isRecord(message.result)) throw new Error("rate limit response had no result");
          return message.result;
        }
      }
    }
  } finally {
    clearTimeout(timeout);
    process_.kill();
  }
}

async function main(): Promise<void> {
  const json = process.argv.includes("--json");
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`Usage: codex-usage [--json]

Reads live Codex rate-limit usage for the signed-in account. Prints each allowance window
with used and remaining percentages and its local reset time. --json prints the raw result.`);
    return;
  }
  const result = await readRateLimits();
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const byLimit = isRecord(result.rateLimitsByLimitId) ? result.rateLimitsByLimitId : undefined;
  const windows: UsageWindow[] = [];
  if (byLimit) {
    for (const [limitId, value] of Object.entries(byLimit)) collectWindows(value, limitId, windows);
  } else {
    collectWindows(result.rateLimits ?? result, "codex", windows);
  }
  if (windows.length === 0) throw new Error(`No usage windows in response: ${JSON.stringify(result)}`);
  windows.sort((left, right) => right.windowMinutes - left.windowMinutes);
  for (const window of windows) {
    const remaining = Math.max(0, 100 - window.usedPercent);
    const label = byLimit ? `${window.limitId} ${windowTitle(window.windowMinutes)}` : windowTitle(window.windowMinutes);
    console.log(
      `${label}: ${window.usedPercent.toFixed(0)}% used, ${remaining.toFixed(0)}% remaining, ${formatReset(window.resetsAt)}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
