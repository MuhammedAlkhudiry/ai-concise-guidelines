#!/usr/bin/env bun

import { spawnSync } from "node:child_process";

type Result = {
  status: number;
  stdout: string;
  stderr: string;
};

const args = Bun.argv.slice(2);
const base = args.find((arg) => arg.startsWith("--base="))?.slice("--base=".length) || "origin/main";
const shouldFetch = args.includes("--fetch");
const shouldMerge = args.includes("--merge");

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

function output(label: string, result: Result): void {
  const text = `${result.stdout}${result.stderr}`.trim();
  console.log(`\n## ${label}`);
  console.log(text || "none");
}

const root = git(["rev-parse", "--show-toplevel"]);
if (root.status !== 0) {
  console.error("Not a git repository.");
  process.exit(1);
}

console.log("# Git branch sync");
console.log(`Root: ${root.stdout.trim()}`);
console.log(`Base: ${base}`);

if (shouldFetch) {
  output("Fetch", git(["fetch", "--all", "--prune"]));
}

output("Status", git(["status", "--short", "--branch"]));
output("Current branch", git(["branch", "--show-current"]));
output("HEAD", git(["rev-parse", "--short", "HEAD"]));
output("Base HEAD", git(["rev-parse", "--short", base]));
output("Merge base", git(["merge-base", "--fork-point", base, "HEAD"]));
output("Ahead / behind", git(["rev-list", "--left-right", "--count", `${base}...HEAD`]));
output("Changed against base", git(["diff", "--name-status", `${base}...HEAD`]));

if (!shouldMerge) {
  console.log("\nRun with --merge to execute: rtk git merge --autostash " + base);
  process.exit(0);
}

console.log(`\n## Merge: rtk git merge --autostash ${base}`);
const merge = git(["merge", "--autostash", base], true);
process.exit(merge.status);
