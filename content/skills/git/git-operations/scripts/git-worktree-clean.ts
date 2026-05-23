#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

type Worktree = {
  path: string;
  branch?: string;
  detached: boolean;
  bare: boolean;
};

const args = Bun.argv.slice(2);
const removeClean = args.includes("--remove-clean");
const forceDirty = args.includes("--force-dirty");

function git(commandArgs: string[], cwd?: string): string {
  const result = spawnSync("rtk", ["git", ...commandArgs], { cwd, encoding: "utf8" });
  if ((result.status ?? 1) !== 0) return "";
  return result.stdout || "";
}

function gitPorcelain(commandArgs: string[], cwd?: string): string {
  const result = spawnSync("rtk", ["proxy", "git", ...commandArgs], { cwd, encoding: "utf8" });
  if ((result.status ?? 1) !== 0) return "";
  return result.stdout || "";
}

function gitStatus(path: string): string[] {
  return git(["status", "--short", "--branch"], path).split(/\r?\n/).filter(Boolean);
}

function parseWorktrees(text: string): Worktree[] {
  const worktrees: Worktree[] = [];
  let current: Worktree | undefined;

  for (const line of text.split(/\r?\n/)) {
    if (!line) {
      if (current) worktrees.push(current);
      current = undefined;
      continue;
    }

    const [key, ...rest] = line.split(" ");
    const value = rest.join(" ");

    if (key === "worktree") current = { path: value, detached: false, bare: false };
    if (!current) continue;
    if (key === "branch") current.branch = value.replace(/^refs\/heads\//, "");
    if (key === "detached") current.detached = true;
    if (key === "bare") current.bare = true;
  }

  if (current) worktrees.push(current);
  return worktrees;
}

const root = git(["rev-parse", "--show-toplevel"]).trim();
if (!root) {
  console.error("Not a git repository.");
  process.exit(1);
}

const worktrees = parseWorktrees(gitPorcelain(["worktree", "list", "--porcelain"]));

console.log("# Git worktree clean");
console.log(`Root: ${root}`);
console.log(`Mode: ${removeClean ? "remove clean" : "preview"}`);
console.log(`Dirty force: ${forceDirty ? "yes" : "no"}`);

for (const worktree of worktrees) {
  const isMain = worktree.path === root;
  const status = gitStatus(worktree.path);
  const dirty = status.some((line) => !line.startsWith("##"));
  const state = dirty ? "dirty" : "clean";
  const label = isMain ? "main" : "secondary";

  console.log(`\n## ${worktree.path}`);
  console.log(`- ${label}, ${state}, ${worktree.branch || "detached"}`);
  for (const line of status.slice(0, 40)) console.log(line);
  if (status.length > 40) console.log(`... ${status.length - 40} more`);

  if (isMain || !removeClean) continue;
  if (dirty && !forceDirty) {
    console.log("skip: dirty worktree requires --force-dirty");
    continue;
  }

  const removeArgs = ["worktree", "remove", ...(dirty ? ["--force"] : []), worktree.path];
  const remove = spawnSync("rtk", ["git", ...removeArgs], { encoding: "utf8", stdio: "pipe" });
  process.stdout.write(remove.stdout || "");
  process.stderr.write(remove.stderr || "");
  console.log(`removed: ${remove.status === 0 ? "yes" : "no"}`);
  console.log(`path exists: ${existsSync(worktree.path) ? "yes" : "no"}`);
}

if (removeClean) {
  const prune = spawnSync("rtk", ["git", "worktree", "prune"], { encoding: "utf8" });
  process.stdout.write(prune.stdout || "");
  process.stderr.write(prune.stderr || "");
  console.log("\nPruned worktree registrations.");
}
