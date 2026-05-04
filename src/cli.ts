#!/usr/bin/env bun

import { join } from "node:path";

import { cac } from "cac";
import { execa } from "execa";

import { generate } from "./commands/generate";
import { install } from "./commands/install";

const ROOT_DIR = join(import.meta.dir, "..");

async function runScript(command: string, args: string[]): Promise<void> {
  await execa(command, args, {
    cwd: ROOT_DIR,
    env: process.env,
    stdio: "inherit",
  });
}

const cli = cac("ai-concise");

cli.command("generate", "Generate OpenCode and Codex output files").action(async () => {
  await generate();
});

cli
  .command("install", "Install generated rules, config, skills, and shell helpers locally")
  .action(async () => {
    await generate();
    await install();
  });

cli
  .command("doctor", "Run the local tool and integration checks")
  .allowUnknownOptions()
  .action(async (_options: unknown, ...args: string[]) => {
    await runScript("zsh", [join(ROOT_DIR, "shell", "doctor.zsh"), ...args]);
  });

cli
  .command("ai [...args]", "Run the ai-assistant CLI")
  .allowUnknownOptions()
  .action(async (args: string[]) => {
    await runScript("bun", [join(ROOT_DIR, "src", "ai-assistant", "cli.ts"), ...args]);
  });

cli.help();
cli.parse();
