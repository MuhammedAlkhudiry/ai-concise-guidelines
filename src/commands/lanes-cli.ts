#!/usr/bin/env bun

import { cac } from "cac";

import {
  projectLanesDestroy,
  projectLanesReset,
  projectLanesSetup,
  projectLanesStatus,
  projectLanesVerify,
} from "./project-lanes";

const cli = cac("lanes");

cli.command("setup [project]", "Create and provision missing lanes").action(projectLanesSetup);

cli
  .command("status [project]", "Show lane readiness")
  .option("--json", "Print machine-readable status")
  .action((project: string | undefined, options: { json?: boolean }) => {
    projectLanesStatus(project, options.json);
  });

cli.command("verify [project]", "Verify lane environments").action(projectLanesVerify);

cli.command("reset <project> <lane>", "Reset one idle lane").action(projectLanesReset);

cli
  .command("destroy <project> <lane>", "Destroy one idle lane")
  .option("--confirm", "Confirm destructive removal")
  .action((project: string, lane: string, options: { confirm?: boolean }) => {
    return projectLanesDestroy(project, lane, options.confirm);
  });

cli.help();
cli.addEventListener("command:*", () => {
  console.error(`Unknown command: ${cli.args.join(" ")}`);
  process.exitCode = 1;
});
cli.parse();
