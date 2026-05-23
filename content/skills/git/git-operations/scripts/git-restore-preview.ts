#!/usr/bin/env bun

import { spawnSync } from "node:child_process";

type Result = {
  status: number;
  stdout: string;
  stderr: string;
};

const args = Bun.argv.slice(2);
const base = args.find((arg) => arg.startsWith("--base="))?.slice("--base=".length) || "main";
const apply = args.includes("--apply");
const all = args.includes("--all");
const removeMissing = args.includes("--remove-missing");
const paths = args.filter(
  (arg) =>
    arg !== "--" &&
    arg !== "--apply" &&
    arg !== "--all" &&
    arg !== "--remove-missing" &&
    !arg.startsWith("--base="),
);

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

function lines(text: string): string[] {
  return text.split(/\r?\n/).filter(Boolean);
}

function pathArgs(): string[] {
  return paths.length ? ["--", ...paths] : [];
}

function existsInBase(path: string): boolean {
  return git(["cat-file", "-e", `${base}:${path}`]).status === 0;
}

const root = git(["rev-parse", "--show-toplevel"]);
if (root.status !== 0) {
  console.error("Not a git repository.");
  process.exit(1);
}

const selectedPaths = paths.length
  ? paths
  : all
    ? lines(git(["diff", "--name-only", base]).stdout)
    : [];

console.log("# Git restore preview");
console.log(`Root: ${root.stdout.trim()}`);
console.log(`Base: ${base}`);

if (!selectedPaths.length) {
  console.log("\nNo paths selected. Pass paths or --all.");
  console.log(`Changed against ${base}:`);
  process.stdout.write(git(["diff", "--name-status", base]).stdout || "none\n");
  process.exit(0);
}

console.log(`Paths: ${selectedPaths.join(", ")}`);
const restorablePaths = selectedPaths.filter(existsInBase);
const missingInBase = selectedPaths.filter((path) => !existsInBase(path));

console.log("\n## Current status");
process.stdout.write(git(["status", "--short", "--", ...selectedPaths]).stdout || "none\n");

console.log(`\n## Diff against ${base}`);
process.stdout.write(git(["diff", "--name-status", base, ...pathArgs()]).stdout || "none\n");

console.log("\n## Command");
if (restorablePaths.length) {
  console.log(
    `rtk git restore --source=${base} -- ${restorablePaths.map((path) => JSON.stringify(path)).join(" ")}`,
  );
}
if (missingInBase.length) {
  console.log(`rtk rm -rf -- ${missingInBase.map((path) => JSON.stringify(path)).join(" ")}`);
  console.log("Missing-base paths require --remove-missing with --apply.");
}

if (!apply) {
  console.log("\nPreview only. Run with --apply to restore selected paths.");
  process.exit(0);
}

if (restorablePaths.length) {
  const restore = git(["restore", `--source=${base}`, "--", ...restorablePaths], true);
  if (restore.status !== 0) process.exit(restore.status);
}

if (missingInBase.length && removeMissing) {
  const remove = spawnSync("rtk", ["rm", "-rf", "--", ...missingInBase], { stdio: "inherit" });
  process.exit(remove.status ?? 1);
}

if (missingInBase.length) {
  console.error("Skipped missing-base paths. Add --remove-missing to delete them.");
  process.exit(1);
}
