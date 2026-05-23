#!/usr/bin/env bun

import { $ } from "bun";
import { spawnSync } from "node:child_process";

const tools: Array<[string, string[]]> = [
  ["rtk", ["--version"]],
  ["gbr", ["--help"]],
  ["hugeicons", ["--help"]],
  ["remote", ["--help"]],
  ["remote-tinker", ["--help"]],
  ["remote-info", ["--help"]],
  ["hosts", ["--help"]],
  ["pdfinfo", ["-v"]],
  ["pdftotext", ["-v"]],
  ["pdftoppm", ["-v"]],
  ["ddev", ["--version"]],
  ["sentry-cli", ["--version"]],
  ["doctl", ["version"]],
  ["gh", ["--version"]],
];

async function exists(command: string): Promise<boolean> {
  return (await $`command -v ${command}`.quiet().nothrow()).exitCode === 0;
}

async function version(command: string, args: string[]): Promise<string> {
  const result = spawnSync(command, args, { encoding: "utf8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  return output.split(/\n/)[0] || "available";
}

console.log("# Tool doctor");

for (const [command, args] of tools) {
  if (!(await exists(command))) {
    console.log(`- missing ${command}`);
    continue;
  }

  console.log(`- ok ${command}: ${await version(command, args)}`);
}
