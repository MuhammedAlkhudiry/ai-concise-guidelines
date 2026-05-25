#!/usr/bin/env bun

import { spawnSync } from "node:child_process";

type Result = {
  status: number;
  stdout: string;
  stderr: string;
};

const args = Bun.argv.slice(2);
const base = args.find((arg) => arg.startsWith("--base="))?.slice("--base=".length) || "origin/main";
const deleteMerged = args.includes("--delete-merged");
const pruneRemotes = args.includes("--prune-remotes");
const protectedNames = new Set(["main", "master", "develop", "dev", "trunk"]);

function git(commandArgs: string[], inherit = false): Result {
  const result = spawnSync("rtk", ["git", ...commandArgs], {
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function gitPorcelain(commandArgs: string[]): Result {
  const result = spawnSync("rtk", ["proxy", "git", ...commandArgs], { encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function lines(text: string): string[] {
  return text.split(/\r?\n/).filter(Boolean);
}

function output(label: string, result: Result): void {
  const text = `${result.stdout}${result.stderr}`.trim();
  console.log(`\n## ${label}`);
  console.log(text || "none");
}

function parseWorktreeBranches(text: string): Set<string> {
  const branches = new Set<string>();

  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("branch ")) continue;
    branches.add(line.slice("branch refs/heads/".length));
  }

  return branches;
}

function isProtected(branch: string): boolean {
  return protectedNames.has(branch) || branch.startsWith("release/") || branch.startsWith("release-");
}

function skippedReason(branch: string, currentBranch: string, worktreeBranches: Set<string>): string {
  if (branch === currentBranch) return "current branch";
  if (worktreeBranches.has(branch)) return "checked out by a worktree";
  if (isProtected(branch)) return "protected branch";
  return "";
}

const root = git(["rev-parse", "--show-toplevel"]);
if (root.status !== 0) {
  console.error("Not a git repository.");
  process.exit(1);
}

console.log("# Git branch clean");
console.log(`Root: ${root.stdout.trim()}`);
console.log(`Base: ${base}`);
console.log(`Mode: ${deleteMerged ? "delete merged" : "preview"}`);
console.log(`Remote prune: ${pruneRemotes ? "yes" : "no"}`);

if (pruneRemotes) {
  output("Prune remotes", git(["fetch", "--all", "--prune"]));
}

const baseRef = gitPorcelain(["rev-parse", "--verify", base]);
if (baseRef.status !== 0) {
  output("Base ref missing", baseRef);
  process.exit(1);
}

const currentBranch = gitPorcelain(["branch", "--show-current"]).stdout.trim();
const allBranches = lines(gitPorcelain(["branch", "--format=%(refname:short)"]).stdout);
const mergedBranches = new Set(lines(gitPorcelain(["branch", "--merged", base, "--format=%(refname:short)"]).stdout));
const worktreeBranches = parseWorktreeBranches(gitPorcelain(["worktree", "list", "--porcelain"]).stdout);

const deletable: string[] = [];
const skipped: string[] = [];
const unmerged: string[] = [];

for (const branch of allBranches) {
  const reason = skippedReason(branch, currentBranch, worktreeBranches);

  if (reason) {
    skipped.push(`${branch}: ${reason}`);
    continue;
  }

  if (mergedBranches.has(branch)) {
    deletable.push(branch);
    continue;
  }

  unmerged.push(branch);
}

console.log("\n## Merged local branches");
console.log(deletable.length ? deletable.join("\n") : "none");

console.log("\n## Skipped");
console.log(skipped.length ? skipped.join("\n") : "none");

console.log("\n## Unmerged branches");
console.log(unmerged.length ? unmerged.join("\n") : "none");

if (!deleteMerged) {
  console.log("\nRun with --delete-merged to delete only the merged local branches listed above.");
  process.exit(0);
}

for (const branch of deletable) {
  output(`Delete ${branch}`, git(["branch", "-D", branch]));
}

output("Remaining local branches", gitPorcelain(["branch", "--format=%(refname:short)"]));
