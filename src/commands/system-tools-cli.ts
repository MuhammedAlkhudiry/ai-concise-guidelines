#!/usr/bin/env bun

import { cac } from "cac";

import { toolsStatus, toolsUpdatePlan } from "./tools";

const cli = cac("system-tools");

cli.command("status", "Show installed external CLI tool versions").action(toolsStatus);

cli
  .command("update-plan", "Print safe update commands for external CLI tools")
  .action(toolsUpdatePlan);

cli.help();
cli.addEventListener("command:*", () => {
  console.error(`Unknown command: ${cli.args.join(" ")}`);
  process.exitCode = 1;
});
cli.parse();
