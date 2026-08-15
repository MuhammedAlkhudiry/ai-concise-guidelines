#!/usr/bin/env bun

import { cac } from "cac";

import {
  projectLaneOpen,
  projectLaneServices,
  projectLaneSimulatorsApply,
  projectLaneSimulatorsRestore,
  projectLaneSimulatorsStatus,
  projectLanesAudit,
  projectLanesDestroy,
  projectLanesProvision,
  projectLanesRepair,
  projectLanesReset,
  projectLanesStatus,
  projectLanesVerify,
} from "./project-lanes";
import { runPlansCommand } from "./plans";

interface MobileOptions {
  mobile?: boolean;
  compact?: boolean;
}

interface ServiceOptions {
  json?: boolean;
  lines?: string;
  follow?: boolean;
  raw?: boolean;
  siteTimeout?: string;
}

interface PlanOptions {
  project?: string;
  plansRoot?: string;
  all?: boolean;
  json?: boolean;
  status?: string;
  write?: boolean;
}

const cli = cac("lanes");

cli
  .command(
    "provision <project> <environment>",
    "Provision resources for a canonical clone or task worktree",
  )
  .option(
    "--root <path>",
    "Project root; defaults to the canonical root for main and the current directory for tasks",
  )
  .option("--mobile", "Provision mobile dependencies and the environment simulator")
  .option("--compact", "Print only the final result and failures")
  .example("lanes provision awraq main")
  .example("lanes provision awraq excel-tree-import --root $PWD")
  .action((project: string, environment: string, options: MobileOptions & { root?: string }) =>
    projectLanesProvision(project, environment, options.root, options.mobile, options.compact),
  );

cli
  .command("status [project]", "Show registered environment readiness")
  .option("--json", "Print machine-readable status")
  .option("--verbose", "Include the complete stored failure after each concise status")
  .action((project: string | undefined, options: { json?: boolean; verbose?: boolean }) =>
    projectLanesStatus(project, options.json, options.verbose),
  );

cli
  .command("verify [project] [environment]", "Verify the current or explicitly named environment")
  .option("--mobile", "Include mobile environment and simulator verification")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, environment: string | undefined, options: MobileOptions) =>
    projectLanesVerify(project, environment, options.mobile, options.compact),
  );

cli
  .command(
    "repair [project] [environment]",
    "Repair and verify the current or explicitly named environment",
  )
  .option("--mobile", "Include mobile environment and simulator repair")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, environment: string | undefined, options: MobileOptions) =>
    projectLanesRepair(project, environment, options.mobile, options.compact),
  );

cli
  .command("audit [project]", "Audit every registered project environment")
  .option("--mobile", "Include mobile-development verification")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, options: MobileOptions) =>
    projectLanesAudit(project, options.mobile, options.compact),
  );

cli
  .command("services <operation> [project] [environment] [service]", "Manage environment services")
  .usage("services <status|start|stop|restart|logs> [project] [environment] [service]")
  .option("--json", "Print machine-readable output")
  .option("--lines <lines>", "Number of recent log lines", { default: "30" })
  .option("--follow", "Follow service logs")
  .option("--raw", "Print raw log text")
  .option("--site-timeout <milliseconds>", "Override the live site probe timeout")
  .action(
    (
      operation: string,
      project: string | undefined,
      environment: string | undefined,
      service: string | undefined,
      options: ServiceOptions,
    ) => projectLaneServices(operation, project, environment, service, options),
  );

cli
  .command("plans <operation> [...query]", "List, edit, status, or archive saved plans")
  .usage("plans <list|show|path|save|status|archive|archive-done|index> [query] [options]")
  .option("--project <project>", "Use a specific project plan folder")
  .option("--plans-root <path>", "Plans root", { default: "~/plans" })
  .option("--all", "Include every project plan folder when listing")
  .option("--json", "Print a machine-readable plan listing")
  .option("--status <status>", "Set status to pending, progress, or done")
  .option("--write", "Rewrite INDEX.md when indexing")
  .action((operation: string, query: string[], options: PlanOptions) => {
    const args = [...query];
    if (options.project) args.push(`--project=${options.project}`);
    if (options.plansRoot) args.push(`--plans-root=${options.plansRoot}`);
    if (options.all) args.push("--all");
    if (options.json) args.push("--json");
    if (options.status) args.push(`--status=${options.status}`);
    if (options.write) args.push("--write");
    runPlansCommand(operation, args);
  });

cli
  .command(
    "open <project> <environment> <target>",
    "Open an environment in PhpStorm, Finder, Simulator, or Browser",
  )
  .action(projectLaneOpen);

cli
  .command(
    "simulators <operation> [project]",
    "Manage SimSlim profiles (status, apply, or restore)",
  )
  .option("--mode <mode>", "Profile to apply or verify: project or full", { default: "project" })
  .option("--json", "Print machine-readable status")
  .action(
    (
      operation: string,
      project: string | undefined,
      options: { json?: boolean; mode?: "project" | "full" },
    ) => {
      if (operation === "status")
        return projectLaneSimulatorsStatus(project, options.mode, options.json);
      if (operation === "apply")
        return projectLaneSimulatorsApply(project, options.mode, options.json);
      if (operation === "restore") return projectLaneSimulatorsRestore(project, options.json);
      throw new Error(`Unknown simulator operation: ${operation}`);
    },
  );

cli
  .command("reset <project> <environment>", "Reset environment data while preserving project files")
  .action(projectLanesReset);

cli
  .command(
    "destroy <project> <environment>",
    "Destroy task-environment resources without deleting its root",
  )
  .option("--confirm", "Confirm resource destruction")
  .action((project: string, environment: string, options: { confirm?: boolean }) =>
    projectLanesDestroy(project, environment, options.confirm),
  );

cli.help();
cli.addEventListener("command:*", () => {
  console.error(`Unknown command: ${cli.args.join(" ")}`);
  process.exitCode = 1;
});
cli.parse(process.argv, { run: false });
await cli.runMatchedCommand();
