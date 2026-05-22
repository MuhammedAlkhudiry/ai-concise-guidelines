#!/usr/bin/env bun

import { spawnSync } from "node:child_process";

type Result = {
  status: number;
  stdout: string;
  stderr: string;
};

const paths = Bun.argv.slice(2).filter((arg) => arg !== "--");

function git(args: string[]): Result {
  const result = spawnSync("rtk", ["git", ...args], { encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function lines(text: string): string[] {
  return text.split(/\r?\n/).filter(Boolean);
}

function printLines(title: string, items: string[], limit = 80): void {
  console.log(`\n## ${title}`);
  if (!items.length) {
    console.log("- none");
    return;
  }

  for (const item of items.slice(0, limit)) console.log(item);
  if (items.length > limit) console.log(`... ${items.length - limit} more`);
}

function pathArgs(): string[] {
  return paths.length ? ["--", ...paths] : [];
}

const root = git(["rev-parse", "--show-toplevel"]);
if (root.status !== 0) {
  console.error("Not a git repository.");
  process.exit(1);
}

const branch = git(["status", "--short", "--branch", ...pathArgs()]);
const porcelain = git(["status", "--porcelain=v1", "-uall", ...pathArgs()]);
const diffNames = git(["diff", "--name-status", ...pathArgs()]);
const stagedNames = git(["diff", "--cached", "--name-status", ...pathArgs()]);
const stat = git(["diff", "--stat", ...pathArgs()]);
const stagedStat = git(["diff", "--cached", "--stat", ...pathArgs()]);
const check = git(["diff", "--check", ...pathArgs()]);

const statusLines = lines(porcelain.stdout);
const staged = statusLines.filter((line) => line[0] !== " " && line[0] !== "?");
const unstaged = statusLines.filter((line) => line[1] !== " " && !line.startsWith("??"));
const untracked = statusLines.filter((line) => line.startsWith("??"));

console.log("# Git snapshot");
console.log(`Root: ${root.stdout.trim()}`);
if (paths.length) console.log(`Paths: ${paths.join(", ")}`);

printLines("Branch", lines(branch.stdout), 20);
console.log("\n## Counts");
console.log(`- changed: ${statusLines.length}`);
console.log(`- staged: ${staged.length}`);
console.log(`- unstaged: ${unstaged.length}`);
console.log(`- untracked: ${untracked.length}`);

printLines("Changed files", statusLines, 120);
printLines("Diff names", lines(diffNames.stdout), 120);
printLines("Staged names", lines(stagedNames.stdout), 120);
printLines("Diff stat", lines(stat.stdout), 80);
printLines("Staged diff stat", lines(stagedStat.stdout), 80);

console.log("\n## Diff check");
if (check.status === 0 && !check.stdout.trim()) {
  console.log("PASS");
} else {
  console.log("FAIL");
  process.stdout.write(check.stdout);
  process.stderr.write(check.stderr);
}
