#!/usr/bin/env bun

import { join } from "node:path";

import { cac } from "cac";
import { execa } from "execa";

import { generate } from "./commands/generate";
import { install } from "./commands/install";
import { toolsStatus, toolsUpdatePlan } from "./commands/tools";

const ROOT_DIR = join(import.meta.dir, "..");

async function runScript(command: string, args: string[]): Promise<void> {
  await execa(command, args, {
    cwd: ROOT_DIR,
    env: process.env,
    stdio: "inherit",
  });
}

const cli = cac("my-setup");

cli
  .command("install", "Install generated rules, config, skills, and shell helpers locally")
  .action(async () => {
    await generate();
    await install();
    await runScript("zsh", [join(ROOT_DIR, "shell", "doctor.zsh")]);
  });

cli
  .command("doctor", "Run the local tool and integration checks")
  .allowUnknownOptions()
  .action(async (_options: unknown, ...args: string[]) => {
    await runScript("zsh", [join(ROOT_DIR, "shell", "doctor.zsh"), ...args]);
  });

cli
  .command("tools <action>", "Inspect external CLI tool status and update plans")
  .action(async (action: string) => {
    if (action === "status") {
      await toolsStatus();
      return;
    }
    if (action === "update-plan") {
      await toolsUpdatePlan();
      return;
    }
    throw new Error(`Unknown tools action: ${action}`);
  });

cli.help();
cli.parse();
