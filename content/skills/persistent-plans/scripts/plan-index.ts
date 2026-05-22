#!/usr/bin/env bun

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

type Plan = {
  name: string;
  path: string;
  status: string;
  updated: string;
  title: string;
};

const args = new Map<string, string | boolean>();
for (let i = 2; i < Bun.argv.length; i++) {
  const arg = Bun.argv[i];
  if (arg === "--write") {
    args.set("write", true);
    continue;
  }
  if (arg.startsWith("--project=")) args.set("project", arg.slice("--project=".length));
  if (arg.startsWith("--plans-root=")) args.set("plans-root", arg.slice("--plans-root=".length));
}

const home = process.env.HOME || "";
const cwdProject = basename(process.cwd().replace(/\/$/, ""));
const project = String(args.get("project") || cwdProject);
const plansRoot = resolve(String(args.get("plans-root") || join(home, "plans")));
const projectRoot = join(plansRoot, project);
const write = args.get("write") === true;

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

function readPlan(entry: string): Plan | undefined {
  const full = join(projectRoot, entry);
  const stat = statSync(full);
  const main = stat.isDirectory() ? join(full, "PLAN.md") : full;
  if (!existsSync(main) || !main.endsWith(".md")) return undefined;

  const text = readFileSync(main, "utf8");
  const meta = frontmatter(text);

  return {
    name: entry,
    path: main,
    status: meta.status || "missing",
    updated: meta.updated || "missing",
    title: title(text, entry),
  };
}

function plans(): Plan[] {
  if (!existsSync(projectRoot)) return [];

  return readdirSync(projectRoot)
    .filter((entry) => entry !== "INDEX.md" && entry !== "archive")
    .map(readPlan)
    .filter((plan): plan is Plan => Boolean(plan))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

const activePlans = plans();
const indexBody = [
  `# ${project} Plans`,
  "",
  ...activePlans.map((plan) => `- [${plan.title}](${plan.name}${plan.name.endsWith(".md") ? "" : "/PLAN.md"}) - ${plan.status}, updated ${plan.updated}`),
  "",
].join("\n");

console.log(`# Plan index for ${project}`);
console.log(`Root: ${projectRoot}`);
console.log(`Active plans: ${activePlans.length}`);
for (const plan of activePlans) {
  console.log(`- ${plan.name}: ${plan.status}, updated ${plan.updated}`);
}

if (write) {
  if (!existsSync(projectRoot)) {
    console.error(`Plan project folder does not exist: ${projectRoot}`);
    process.exit(1);
  }
  writeFileSync(join(projectRoot, "INDEX.md"), indexBody);
  console.log("\nINDEX.md updated.");
} else {
  console.log("\nRun with --write to update INDEX.md.");
}
