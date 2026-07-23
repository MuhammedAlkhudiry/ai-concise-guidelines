#!/usr/bin/env bun

import { cac } from "cac";

import {
  projectLaneSimulatorsApply,
  projectLaneSimulatorsRestore,
  projectLaneSimulatorsStatus,
  projectLaneOpen,
  projectLaneServices,
  projectLanesDestroy,
  projectLanesAudit,
  projectLanesReset,
  projectLanesSetup,
  projectLanesStatus,
  projectLanesVerify,
} from "./project-lanes";

interface SimulatorOptions {
  json?: boolean;
  mode?: "project" | "full";
}

interface CompactOptions {
  compact?: boolean;
}

interface AuditOptions extends CompactOptions {
  mobile?: boolean;
}

interface ServiceOptions {
  json?: boolean;
  lines?: string;
  follow?: boolean;
  raw?: boolean;
}

const cli = cac("lanes");

cli
  .command("setup [project]", "Create and provision missing lanes")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, options: CompactOptions) =>
    projectLanesSetup(project, options.compact),
  );

cli
  .command("status [project]", "Show lane readiness")
  .option("--json", "Print machine-readable status")
  .action((project: string | undefined, options: { json?: boolean }) => {
    projectLanesStatus(project, options.json);
  });

cli
  .command("verify [project] [lane]", "Verify the current or explicitly named lane")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, lane: string | undefined, options: CompactOptions) =>
    projectLanesVerify(project, lane, options.compact),
  );

cli
  .command("audit [project]", "Audit every configured lane environment")
  .option("--mobile", "Include mobile-development verification for every lane")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, options: AuditOptions) =>
    projectLanesAudit(project, options.mobile, options.compact),
  );

cli
  .command(
    "services <operation> [project] [lane] [service]",
    "Manage lane services; use all for every lane or service",
  )
  .option("--json", "Print machine-readable output")
  .option("--lines <lines>", "Number of recent log lines", { default: "30" })
  .option("--follow", "Follow service logs")
  .option("--raw", "Print raw log text")
  .action(
    (
      operation: string,
      project: string | undefined,
      lane: string | undefined,
      service: string | undefined,
      options: ServiceOptions,
    ) => projectLaneServices(operation, project, lane, service, options),
  );

cli
  .command("open <project> <lane> <target>", "Open a lane in PhpStorm, Simulator, or Browser")
  .action(projectLaneOpen);

cli
  .command(
    "simulators <operation> [project]",
    "Manage SimSlim profiles (status, apply, or restore)",
  )
  .option("--mode <mode>", "Profile to apply or verify: project or full", {
    default: "project",
  })
  .option("--json", "Print machine-readable status")
  .action(
    (operation: string, project: string | undefined, options: SimulatorOptions): Promise<void> => {
      if (operation === "status") {
        return projectLaneSimulatorsStatus(project, options.mode, options.json);
      }
      if (operation === "apply") {
        return projectLaneSimulatorsApply(project, options.mode, options.json);
      }
      if (operation === "restore") {
        return projectLaneSimulatorsRestore(project, options.json);
      }
      throw new Error(`Unknown simulator operation: ${operation}`);
    },
  );

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
