#!/usr/bin/env bun

import { join } from "node:path";

import { cac } from "cac";
import { execa } from "execa";

import { generate } from "./commands/generate";
import { install } from "./commands/install";
import {
  projectLanesAcquire,
  projectLanesDestroy,
  projectLanesRelease,
  projectLanesReset,
  projectLanesSetup,
  projectLanesStatus,
  projectLanesVerify,
} from "./commands/project-lanes";
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

cli
  .command("lanes <action> [...args]", "Manage persistent clone lanes for active projects")
  .option("--json", "Print machine-readable status")
  .option("--task <task>", "Task description or identifier")
  .option("--owner <owner>", "Lease owner identifier")
  .option("--confirm", "Confirm destructive removal")
  .action(
    async (
      action: string,
      args: string[],
      options: { json?: boolean; task?: string; owner?: string; confirm?: boolean },
    ) => {
      const required = (index: number, name: string): string => {
        const value = args[index];
        if (!value) throw new Error(`${name} is required for lanes ${action}`);
        return value;
      };

      if (action === "setup") return projectLanesSetup(args[0]);
      if (action === "status") return projectLanesStatus(args[0], options.json);
      if (action === "verify") return projectLanesVerify(args[0]);
      if (action === "acquire") {
        if (!options.task) throw new Error("--task is required for lanes acquire");
        return projectLanesAcquire(
          required(0, "project"),
          required(1, "branch"),
          options.task,
          options.owner,
        );
      }
      if (action === "release") {
        return projectLanesRelease(required(0, "project"), required(1, "lane"));
      }
      if (action === "reset") {
        return projectLanesReset(required(0, "project"), required(1, "lane"));
      }
      if (action === "destroy") {
        return projectLanesDestroy(required(0, "project"), required(1, "lane"), options.confirm);
      }
      throw new Error(`Unknown lanes action: ${action}`);
    },
  );

cli.help();
cli.parse();
