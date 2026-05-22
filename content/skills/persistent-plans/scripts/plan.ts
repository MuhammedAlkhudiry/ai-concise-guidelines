#!/usr/bin/env bun

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

type Plan = {
  name: string;
  path: string;
  relativePath: string;
  status: string;
  updated: string;
  title: string;
};

type Options = {
  project: string;
  plansRoot: string;
  write: boolean;
};

const home = process.env.HOME || "";

function usage(): void {
  console.log(`Usage: plan <command> [options]

Commands:
  list     List active persistent plans for the current project
  index    Print or rewrite the active plan index

Options:
  --project=<name>       Project folder under ~/plans
  --plans-root=<path>    Plans root, defaults to ~/plans
  --write                Rewrite INDEX.md with the active plan index`);
}

function parseOptions(args: string[]): Options {
  const cwdProject = basename(process.cwd().replace(/\/$/, ""));
  let project = cwdProject;
  let plansRoot = join(home, "plans");
  let write = false;

  for (const arg of args) {
    if (arg === "--write") {
      write = true;
      continue;
    }

    if (arg.startsWith("--project=")) {
      project = arg.slice("--project=".length);
      continue;
    }

    if (arg.startsWith("--plans-root=")) {
      plansRoot = arg.slice("--plans-root=".length);
    }
  }

  return {
    project,
    plansRoot: resolve(plansRoot.replace(/^~/, home)),
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

function readPlan(projectRoot: string, entry: string): Plan | undefined {
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
    relativePath,
    status: meta.status || "missing",
    updated: meta.updated || "missing",
    title: title(text, entry),
  };
}

function activePlans(projectRoot: string): Plan[] {
  if (!existsSync(projectRoot)) return [];

  return readdirSync(projectRoot)
    .filter((entry) => entry !== "INDEX.md" && entry !== "archive")
    .map((entry) => readPlan(projectRoot, entry))
    .filter((plan): plan is Plan => Boolean(plan))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

function indexBody(project: string, plans: Plan[]): string {
  return [
    `# ${project} Plans`,
    "",
    ...plans.map(
      (plan) => `- [${plan.title}](${plan.relativePath}) - ${plan.status}, updated ${plan.updated}`,
    ),
    "",
  ].join("\n");
}

function pad(value: string, width: number): string {
  return value + " ".repeat(Math.max(0, width - value.length));
}

function listPlans(options: Options): void {
  const projectRoot = join(options.plansRoot, options.project);
  const plans = activePlans(projectRoot);

  console.log(`${options.project} plans`);
  console.log(projectRoot);
  console.log("");

  if (plans.length === 0) {
    console.log("No active plans found.");
    return;
  }

  const titleWidth = Math.min(
    48,
    Math.max("Title".length, ...plans.map((plan) => plan.title.length)),
  );
  const statusWidth = Math.min(
    24,
    Math.max("Status".length, ...plans.map((plan) => plan.status.length)),
  );
  const updatedWidth = Math.max("Updated".length, ...plans.map((plan) => plan.updated.length));

  console.log(
    `${pad("Updated", updatedWidth)}  ${pad("Status", statusWidth)}  ${pad("Title", titleWidth)}  File`,
  );
  console.log(
    `${"-".repeat(updatedWidth)}  ${"-".repeat(statusWidth)}  ${"-".repeat(titleWidth)}  ${"-".repeat(4)}`,
  );

  for (const plan of plans) {
    const displayTitle =
      plan.title.length > titleWidth ? `${plan.title.slice(0, titleWidth - 3)}...` : plan.title;
    console.log(
      `${pad(plan.updated, updatedWidth)}  ${pad(plan.status, statusWidth)}  ${pad(displayTitle, titleWidth)}  ${plan.relativePath}`,
    );
  }
}

function indexPlans(options: Options): void {
  const projectRoot = join(options.plansRoot, options.project);
  const plans = activePlans(projectRoot);

  console.log(`# Plan index for ${options.project}`);
  console.log(`Root: ${projectRoot}`);
  console.log(`Active plans: ${plans.length}`);
  for (const plan of plans) {
    console.log(`- ${plan.name}: ${plan.status}, updated ${plan.updated}`);
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

if (command === "help" || command === "--help" || command === "-h") {
  usage();
} else if (command === "list") {
  listPlans(parseOptions(rawOptions));
} else if (command === "index") {
  indexPlans(parseOptions(rawOptions));
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}
