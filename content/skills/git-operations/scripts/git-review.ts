#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

type Result = {
  status: number;
  stdout: string;
  stderr: string;
};

const args = Bun.argv.slice(2);
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = Number(limitArg?.slice("--limit=".length) || 220);
const cached = args.includes("--cached");
const paths = args.filter((arg) => arg !== "--" && arg !== "--cached" && !arg.startsWith("--limit="));

function git(commandArgs: string[]): Result {
  const result = spawnSync("rtk", ["git", ...commandArgs], { encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function split(text: string): string[] {
  return text.split(/\r?\n/).filter(Boolean);
}

function pathArgs(extraPaths = paths): string[] {
  return extraPaths.length ? ["--", ...extraPaths] : [];
}

function diffArgs(options: string[] = [], extraPaths = paths): string[] {
  return ["diff", ...(cached ? ["--cached"] : []), ...options, ...pathArgs(extraPaths)];
}

function printSection(title: string, text: string): void {
  console.log(`\n## ${title}`);
  const trimmed = text.trimEnd();
  console.log(trimmed || "none");
}

function isUnderPath(file: string): boolean {
  if (!paths.length) return true;
  return paths.some((path) => file === path || file.startsWith(`${path.replace(/\/$/, "")}/`));
}

function untrackedFiles(): string[] {
  return split(git(["status", "--porcelain=v1", "-uall", ...pathArgs()]).stdout)
    .filter((line) => line.startsWith("?? "))
    .map((line) => line.slice(3))
    .filter(isUnderPath);
}

function previewFile(file: string): string[] {
  if (!existsSync(file) || !statSync(file).isFile()) return [];

  const buffer = readFileSync(file);
  if (buffer.includes(0)) return ["binary file"];

  return buffer.toString("utf8").split(/\r?\n/);
}

const root = git(["rev-parse", "--show-toplevel"]);
if (root.status !== 0) {
  console.error("Not a git repository.");
  process.exit(1);
}

const names = split(git(diffArgs(["--name-only"])).stdout);
const untracked = untrackedFiles();
const stat = git(diffArgs(["--stat"]));
const check = git(diffArgs(["--check"]));

console.log("# Git review");
console.log(`Root: ${root.stdout.trim()}`);
console.log(`Mode: ${cached ? "cached" : "working tree"}`);
if (paths.length) console.log(`Paths: ${paths.join(", ")}`);

printSection(
  "Files",
  [
    ...names.map((name) => `- ${name}`),
    ...untracked.map((name) => `- ${name} (untracked)`),
  ].join("\n"),
);
printSection("Stat", stat.stdout);

console.log("\n## Diff check");
if (check.status === 0 && !check.stdout.trim()) {
  console.log("PASS");
} else {
  console.log("FAIL");
  process.stdout.write(check.stdout);
  process.stderr.write(check.stderr);
}

for (const file of names) {
  const diff = split(git(diffArgs([], [file])).stdout);
  console.log(`\n## Diff: ${file}`);
  if (!diff.length) {
    console.log("none");
    continue;
  }
  for (const line of diff.slice(0, limit)) console.log(line);
  if (diff.length > limit) console.log(`... ${diff.length - limit} more lines`);
}

for (const file of untracked) {
  const preview = previewFile(file);
  console.log(`\n## Untracked: ${file}`);
  if (!preview.length) {
    console.log("none");
    continue;
  }
  for (const line of preview.slice(0, limit)) console.log(line);
  if (preview.length > limit) console.log(`... ${preview.length - limit} more lines`);
}
