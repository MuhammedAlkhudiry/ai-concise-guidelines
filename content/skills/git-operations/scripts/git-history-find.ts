#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

type Result = {
  status: number;
  stdout: string;
  stderr: string;
};

const query = Bun.argv[2] || "";
const limit = Number(Bun.argv.find((arg) => arg.startsWith("--limit="))?.slice("--limit=".length) || 20);

function git(args: string[]): Result {
  const result = spawnSync("rtk", ["git", ...args], { encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function print(title: string, result: Result): void {
  console.log(`\n## ${title}`);
  const output = `${result.stdout}${result.stderr}`.trim();
  console.log(output || "none");
}

if (!query) {
  console.error("Usage: git-history-find.ts <query-or-path> [--limit=20]");
  process.exit(1);
}

const root = git(["rev-parse", "--show-toplevel"]);
if (root.status !== 0) {
  console.error("Not a git repository.");
  process.exit(1);
}

console.log("# Git history find");
console.log(`Root: ${root.stdout.trim()}`);
console.log(`Query: ${query}`);

if (existsSync(query)) {
  print(
    "Followed file history",
    git([
      "log",
      "--all",
      "--follow",
      "--name-status",
      "--date=short",
      `--max-count=${limit}`,
      "--pretty=format:%h %ad %s",
      "--",
      query,
    ]),
  );
  process.exit(0);
}

print(
  "Matching paths in history",
  git([
    "log",
    "--all",
    "--name-only",
    "--date=short",
    `--max-count=${limit}`,
    "--pretty=format:%h %ad %s",
    "--",
    `*${query}*`,
  ]),
);

print("Commit search", git(["log", "--all", `--max-count=${limit}`, "--oneline", "--decorate", "--grep", query]));
