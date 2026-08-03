#!/usr/bin/env bun

import { cac } from "cac";

import {
  projectLaneSimulatorsApply,
  projectLaneSimulatorsRestore,
  projectLaneSimulatorsStatus,
  projectLaneOpen,
  projectLanePullRequest,
  projectLaneCi,
  projectLaneServices,
  projectLanesAdd,
  projectLanesDestroy,
  projectLanesAudit,
  projectLanesCleanup,
  projectLanesRelease,
  projectLanesReset,
  projectLanesSetup,
  projectLanesStatus,
  projectLanesSync,
  projectLanesVerify,
  resumeProjectLaneCleanup,
} from "./project-lanes";
import { runPlansCommand } from "./plans";

interface SimulatorOptions {
  json?: boolean;
  mode?: "project" | "full";
}

interface CompactOptions {
  compact?: boolean;
}

interface MobileOptions extends CompactOptions {
  mobile?: boolean;
}

interface LaneAddOptions extends MobileOptions {
  branch?: string;
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
  write?: boolean;
}

const cli = cac("lanes");

cli
  .command("setup [project]", "Create and provision missing lanes")
  .option("--mobile", "Provision mobile dependencies and the lane simulator")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, options: MobileOptions) =>
    projectLanesSetup(project, options.mobile, options.compact),
  );

cli
  .command("add <project> [number]", "Register and provision a new local lane")
  .option("--branch <branch>", "Create a local task branch from the latest remote base")
  .option("--mobile", "Provision mobile dependencies and the lane simulator")
  .option("--compact", "Print only the final result and failures")
  .action((project: string, number: string | undefined, options: LaneAddOptions) =>
    projectLanesAdd(project, number, options.mobile, options.compact, options.branch),
  );

cli
  .command("status [project]", "Show lane readiness")
  .option("--json", "Print machine-readable status")
  .action((project: string | undefined, options: { json?: boolean }) =>
    projectLanesStatus(project, options.json),
  );

cli
  .command("sync <project> <lane>", "Fetch and fast-forward one clean available lane")
  .action((project: string, lane: string) => projectLanesSync(project, lane));

cli
  .command("verify [project] [lane]", "Verify the current or explicitly named lane")
  .option("--mobile", "Include mobile environment and lane simulator verification")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, lane: string | undefined, options: MobileOptions) =>
    projectLanesVerify(project, lane, options.mobile, options.compact),
  );

cli
  .command("audit [project]", "Audit every configured lane environment")
  .option("--mobile", "Include mobile-development verification for every lane")
  .option("--compact", "Print only the final result and failures")
  .action((project: string | undefined, options: MobileOptions) =>
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
  .option("--site-timeout <milliseconds>", "Override the live site probe timeout")
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
  .command("ci <operation> <project> [lane]", "Show pull-request CI status by project or lane")
  .option("--json", "Print machine-readable status")
  .action(
    (operation: string, project: string, lane: string | undefined, options: { json?: boolean }) =>
      projectLaneCi(operation, project, lane, Boolean(options.json)),
  );

cli
  .command("pr <operation> <project> <lane>", "Create a pull request for a lane")
  .option("--json", "Print machine-readable output")
  .action((operation: string, project: string, lane: string, options: { json?: boolean }) =>
    projectLanePullRequest(operation, project, lane, Boolean(options.json)),
  );

cli
  .command("plans <operation> [...query]", "List, show, locate, archive, or index saved plans")
  .usage("plans <list|show|path|archive|index> [query] [options]")
  .option("--project <project>", "Use a specific project plan folder")
  .option("--plans-root <path>", "Plans root", { default: "~/plans" })
  .option("--write", "Rewrite INDEX.md when indexing")
  .example("lanes plans list")
  .example("lanes plans show billing")
  .example("lanes plans archive billing")
  .example("lanes plans index --write")
  .action((operation: string, query: string[], options: PlanOptions) => {
    const args = [...query];
    if (options.project) args.push(`--project=${options.project}`);
    if (options.plansRoot) args.push(`--plans-root=${options.plansRoot}`);
    if (options.write) args.push("--write");
    runPlansCommand(operation, args);
  });

cli
  .command(
    "open <project> <lane> <target>",
    "Open a lane in PhpStorm, Finder, Simulator, Browser, or on GitHub",
  )
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
  .command("release <project> <lane>", "Return one clean lane to the available pool")
  .option("--confirm", "Confirm branch cleanup and task-data reset")
  .option("--mobile", "Provision mobile dependencies and the lane simulator")
  .option("--compact", "Print only the final result and failures")
  .action(
    (
      project: string,
      lane: string,
      options: { confirm?: boolean; mobile?: boolean; compact?: boolean },
    ) => projectLanesRelease(project, lane, options.confirm, options.mobile, options.compact),
  );

cli
  .command("destroy <project> <lane>", "Destroy one idle lane")
  .option("--confirm", "Confirm destructive removal")
  .action((project: string, lane: string, options: { confirm?: boolean }) => {
    return projectLanesDestroy(project, lane, options.confirm);
  });

cli
  .command("cleanup <operation>", "Inspect or retry durable lane cleanup jobs")
  .option("--json", "Print machine-readable cleanup status")
  .action((operation: string, options: { json?: boolean }) =>
    projectLanesCleanup(operation, Boolean(options.json)),
  );

cli.help((sections) => {
  if (cli.matchedCommand?.name !== "plans") return sections;
  return [
    ...sections,
    {
      title: "Plan files",
      body: [
        "Keep active plans under ~/plans/<project-id>/ and archived plans in archive/.",
        "Use <name>.md, or <name>/PLAN.md when a plan needs supporting files.",
        "Required frontmatter: created, updated, project, and description.",
        "Author plans directly; this command finds, reads, indexes, and archives them.",
      ].join("\n"),
    },
  ];
});
cli.addEventListener("command:*", () => {
  console.error(`Unknown command: ${cli.args.join(" ")}`);
  process.exitCode = 1;
});
cli.parse(process.argv, { run: false });
if (cli.args[0] !== "cleanup" && cli.args[0] !== "destroy") resumeProjectLaneCleanup();
await cli.runMatchedCommand();
