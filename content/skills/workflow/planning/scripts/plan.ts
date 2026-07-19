#!/usr/bin/env bun

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, join, resolve } from "node:path";

type Plan = {
  name: string;
  path: string;
  project: string;
  relativePath: string;
  updated: string;
  title: string;
  description: string;
};

type Options = {
  project: string;
  projectExplicit: boolean;
  plansRoot: string;
  query: string;
  write: boolean;
};

const home = process.env.HOME || "";

function usage(): void {
  console.log(`Usage: plan <command> [query] [options]

Commands:
  list      List active plan files for the current project
  show      Print the latest plan, or the plan matching query
  path      Print the file path for the latest plan, or the plan matching query
  archive   Move a plan into archive/
  index     Print or rewrite the active plan index

Options:
  --project=<name>       Project folder under ~/plans
  --plans-root=<path>    Plans root, defaults to ~/plans
  --write                Rewrite INDEX.md with the active plan index
  -h, --help             Show this help

Plan files:
  The CLI finds, reads, indexes, and archives plans; author plan files directly.
  Keep active plans under ~/plans/<project-name>/ and archived plans in archive/.
  Use a Markdown file for a standalone plan, or <plan-name>/PLAN.md when it needs supporting files.
  Keep INDEX.md as the active-plan entry point and refresh it with plan index --write.
  Update the updated date whenever the plan body changes.

Required frontmatter:
  ---
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  project: project-name
  description: Short list-view summary
  ---`);
}

function parseOptions(args: string[]): Options {
  const remote = spawnSync("git", ["remote", "get-url", "origin"], {
    cwd: process.cwd(),
    encoding: "utf8",
  }).stdout.trim();
  const remoteProject = remote.match(/([^/:]+?)(?:\.git)?$/)?.[1];
  const cwdProject = remoteProject || basename(process.cwd().replace(/\/$/, ""));
  const query: string[] = [];
  let project = cwdProject;
  let projectExplicit = false;
  let plansRoot = join(home, "plans");
  let write = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--write") {
      write = true;
      continue;
    }

    if (arg.startsWith("--project=")) {
      project = arg.slice("--project=".length);
      projectExplicit = true;
      continue;
    }

    if (arg.startsWith("--plans-root=")) {
      plansRoot = arg.slice("--plans-root=".length);
      continue;
    }

    query.push(arg);
  }

  return {
    project,
    projectExplicit,
    plansRoot: resolve(plansRoot.replace(/^~/, home)),
    query: query.join(" ").trim(),
    write,
  };
}

function frontmatter(text: string): Record<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  return Object.fromEntries(
    match[1]
      .split(/\n/)
      .map((line) => line.match(/^([^:]+):\s*(.+)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1].trim(), match[2].trim()]),
  );
}

function title(text: string, fallback: string): string {
  return text.match(/^#\s+(.+)$/m)?.[1].trim() || fallback.replace(/\.md$/, "");
}

function readPlan(projectRoot: string, project: string, entry: string): Plan | undefined {
  const full = join(projectRoot, entry);
  const stat = statSync(full);
  const main = stat.isDirectory() ? join(full, "PLAN.md") : full;
  if (!existsSync(main) || !main.endsWith(".md")) return undefined;

  const text = readFileSync(main, "utf8");
  const meta = frontmatter(text);
  const relativePath = stat.isDirectory() ? `${entry}/PLAN.md` : entry;

  return {
    name: entry,
    path: main,
    project,
    relativePath,
    updated: meta.updated || "missing",
    title: title(text, entry),
    description: meta.description || "",
  };
}

function activePlans(projectRoot: string, project: string): Plan[] {
  if (!existsSync(projectRoot)) return [];

  return readdirSync(projectRoot)
    .filter((entry) => entry !== "INDEX.md" && entry !== "archive")
    .map((entry) => readPlan(projectRoot, project, entry))
    .filter((plan): plan is Plan => Boolean(plan))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

function indexBody(project: string, plans: Plan[]): string {
  return [
    `# ${project} Plans`,
    "",
    ...plans.map((plan) => `- [${plan.title}](${plan.relativePath}) - updated ${plan.updated}`),
    "",
  ].join("\n");
}

function pad(value: string, width: number): string {
  return value + " ".repeat(Math.max(0, width - value.length));
}

function relatedProjectNames(options: Options): string[] {
  return [options.project];
}

function activePlansForList(options: Options): Plan[] {
  return relatedProjectNames(options)
    .flatMap((project) => activePlans(join(options.plansRoot, project), project))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

function groupPlansByProject(projects: string[], plans: Plan[]): Map<string, Plan[]> {
  const grouped = new Map(projects.map((project) => [project, [] as Plan[]]));

  for (const plan of plans) {
    grouped.get(plan.project)?.push(plan);
  }

  return grouped;
}

function matches(plan: Plan, query: string): boolean {
  const normalized = query.toLowerCase();

  return [plan.name, plan.relativePath, plan.title, plan.description].some((value) =>
    value.toLowerCase().includes(normalized),
  );
}

function findPlan(options: Options): Plan | undefined {
  const plans = activePlans(join(options.plansRoot, options.project), options.project);
  if (!options.query) return plans[0];

  const exact = plans.find(
    (plan) =>
      plan.name === options.query ||
      plan.relativePath === options.query ||
      plan.title.toLowerCase() === options.query.toLowerCase(),
  );

  return exact || plans.find((plan) => matches(plan, options.query));
}

function requirePlan(options: Options): Plan {
  const projectRoot = join(options.plansRoot, options.project);
  const plan = findPlan(options);

  if (plan) return plan;

  if (options.query) {
    console.error(`No plan matched "${options.query}" in ${projectRoot}.`);
  } else {
    console.error(`No active plans found in ${projectRoot}.`);
  }
  process.exit(1);
}

function printPlansTable(plans: Plan[]): void {
  if (plans.length === 0) {
    return;
  }

  const titleWidth = Math.min(
    48,
    Math.max("Title".length, ...plans.map((plan) => plan.title.length)),
  );
  const updatedWidth = Math.max("Updated".length, ...plans.map((plan) => plan.updated.length));
  const descriptionWidth = Math.min(
    56,
    Math.max("Description".length, ...plans.map((plan) => plan.description.length)),
  );

  console.log(
    `${pad("Updated", updatedWidth)}  ${pad("Title", titleWidth)}  ${pad("Description", descriptionWidth)}  File`,
  );
  console.log(
    `${"-".repeat(updatedWidth)}  ${"-".repeat(titleWidth)}  ${"-".repeat(descriptionWidth)}  ${"-".repeat(4)}`,
  );

  for (const plan of plans) {
    const displayTitle =
      plan.title.length > titleWidth ? `${plan.title.slice(0, titleWidth - 3)}...` : plan.title;
    const displayDescription =
      plan.description.length > descriptionWidth
        ? `${plan.description.slice(0, descriptionWidth - 3)}...`
        : plan.description;
    console.log(
      `${pad(plan.updated, updatedWidth)}  ${pad(displayTitle, titleWidth)}  ${pad(displayDescription, descriptionWidth)}  ${plan.relativePath}`,
    );
  }
}

function listPlans(options: Options): void {
  const projectRoot = join(options.plansRoot, options.project);
  const projectNames = relatedProjectNames(options);
  const plans = activePlansForList(options);
  const multipleProjects = projectNames.length > 1;

  console.log(`${options.project} plans`);
  console.log(multipleProjects ? options.plansRoot : projectRoot);
  if (multipleProjects) {
    console.log(`Projects: ${projectNames.join(", ")}`);
  }
  console.log("");

  if (plans.length === 0) {
    console.log("No active plans found.");
    return;
  }

  if (!multipleProjects) {
    printPlansTable(plans);
    return;
  }

  const groupedPlans = groupPlansByProject(projectNames, plans);
  let printedAnyProject = false;

  for (const project of projectNames) {
    const projectPlans = groupedPlans.get(project) || [];
    if (projectPlans.length === 0) continue;

    if (printedAnyProject) console.log("");
    console.log(`${project}`);
    printPlansTable(projectPlans);
    printedAnyProject = true;
  }
}

function showPlan(options: Options): void {
  const plan = requirePlan(options);

  console.log(readFileSync(plan.path, "utf8"));
}

function showPath(options: Options): void {
  console.log(requirePlan(options).path);
}

function archivePlan(options: Options): void {
  const projectRoot = join(options.plansRoot, options.project);
  const plans = activePlans(projectRoot, options.project);
  let selectedPlans: string[] = [];

  if (options.query) {
    selectedPlans = [requirePlan(options).name];
  } else {
    if (plans.length === 0) {
      console.log("No active plans found.");
      return;
    }

    const selectionLines = [
      "Plan\tDescription",
      ...plans.map((plan) => `${plan.name}\t${plan.description}`),
    ];

    const selection = spawnSync(
      "fzf",
      [
        "--height=40%",
        "--multi",
        "--reverse",
        "--border=rounded",
        "--header-lines=1",
        "--prompt=Plans > ",
        "--header=Select plans to archive with Tab, then Enter",
        "--exit-0",
      ],
      {
        input: selectionLines.join("\n"),
        encoding: "utf8",
      },
    );

    if (selection.error) {
      console.error("fzf is required for interactive selection.");
      process.exit(1);
    }

    selectedPlans = selection.stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("\t")[0]);
  }

  if (selectedPlans.length === 0) {
    process.exit(1);
  }

  const archiveRoot = join(projectRoot, "archive");

  for (const selected of selectedPlans) {
    const target = join(archiveRoot, selected);

    if (existsSync(target)) {
      console.error(`Archived plan already exists: ${target}`);
      process.exit(1);
    }
  }

  mkdirSync(archiveRoot, { recursive: true });
  for (const selected of selectedPlans) {
    renameSync(join(projectRoot, selected), join(archiveRoot, selected));
  }

  writeFileSync(
    join(projectRoot, "INDEX.md"),
    indexBody(options.project, activePlans(projectRoot, options.project)),
  );

  console.log(`Archived ${selectedPlans.length} plan${selectedPlans.length === 1 ? "" : "s"}.`);
  for (const selected of selectedPlans) {
    console.log(join(archiveRoot, selected));
  }
}

function indexPlans(options: Options): void {
  const projectRoot = join(options.plansRoot, options.project);
  const plans = activePlans(projectRoot, options.project);

  console.log(`# Plan index for ${options.project}`);
  console.log(`Root: ${projectRoot}`);
  console.log(`Active plans: ${plans.length}`);
  for (const plan of plans) {
    console.log(`- ${plan.name}: updated ${plan.updated}`);
  }

  if (options.write) {
    if (!existsSync(projectRoot)) {
      console.error(`Plan project folder does not exist: ${projectRoot}`);
      process.exit(1);
    }
    writeFileSync(join(projectRoot, "INDEX.md"), indexBody(options.project, plans));
    console.log("\nINDEX.md updated.");
  } else {
    console.log("\nRun with --write to update INDEX.md.");
  }
}

const [command = "list", ...rawOptions] = Bun.argv.slice(2);
const options = parseOptions(rawOptions);
const helpRequested = [command, ...rawOptions].some(
  (arg) => arg === "help" || arg === "--help" || arg === "-h",
);

if (helpRequested) {
  usage();
} else if (command === "list") {
  listPlans(options);
} else if (command === "show" || command === "latest") {
  showPlan(options);
} else if (command === "path") {
  showPath(options);
} else if (
  command === "archive" ||
  command === "delete" ||
  command === "remove" ||
  command === "rm"
) {
  archivePlan(options);
} else if (command === "index") {
  indexPlans(options);
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}
