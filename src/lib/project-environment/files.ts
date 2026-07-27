import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { log, run } from "./command";
import type { MarkedInstall, ProjectEnvironmentContext } from "./types";

export function copyIfMissing(source: string, destination: string): void {
  if (existsSync(destination)) return;
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

export function readEnv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => /^([A-Z0-9_]+)=(.*)$/.exec(line))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => [match[1], parseEnvValue(match[2])]),
  );
}

function parseEnvValue(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value) as string;
    } catch {
      return value.slice(1, -1);
    }
  }
  return value;
}

function serializeEnvValue(value: string): string {
  return /\s/.test(value) ? JSON.stringify(value) : value;
}

export function upsertEnvValues(path: string, values: Record<string, string>): void {
  const lines = existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/) : [];
  const pending = new Map(Object.entries(values));
  const updated = lines.map((line) => {
    const match = /^([A-Z0-9_]+)=/.exec(line);
    if (!match || !pending.has(match[1])) return line;
    const value = `${match[1]}=${serializeEnvValue(pending.get(match[1])!)}`;
    pending.delete(match[1]);
    return value;
  });
  for (const [key, value] of pending) updated.push(`${key}=${serializeEnvValue(value)}`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${updated.join("\n").replace(/\n+$/, "")}\n`);
}

export function hashFiles(root: string, paths: string[]): string {
  const hash = createHash("sha256");
  for (const path of paths) {
    hash
      .update(path)
      .update("\0")
      .update(readFileSync(resolve(root, path)))
      .update("\0");
  }
  return hash.digest("hex");
}

export function ensureMarkedInstall(
  context: ProjectEnvironmentContext,
  step: string,
  install: MarkedInstall,
): void {
  const marker = resolve(context.root, install.marker);
  const expected = hashFiles(install.hashRoot, install.hashFiles);
  const current = existsSync(marker) ? readFileSync(marker, "utf8").trim() : "";
  if (current === expected) {
    log(step, `${install.label} is current`);
    return;
  }
  run(context, step, install.command, install.args, { cwd: install.cwd });
  mkdirSync(dirname(marker), { recursive: true });
  writeFileSync(marker, `${expected}\n`);
}
