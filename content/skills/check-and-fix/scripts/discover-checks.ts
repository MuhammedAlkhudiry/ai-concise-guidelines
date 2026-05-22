#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type ComposerJson = {
  require?: Record<string, string>;
  "require-dev"?: Record<string, string>;
  scripts?: Record<string, string | string[]>;
};

const root = resolve(Bun.argv[2] ?? ".");

function readJson<T>(path: string): T | undefined {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function has(path: string): boolean {
  return existsSync(join(root, path));
}

function printSection(title: string, lines: string[]): void {
  console.log(`\n## ${title}`);
  if (!lines.length) {
    console.log("- none found");
    return;
  }
  for (const line of lines) console.log(`- ${line}`);
}

function commandFromPackageManager(): string {
  if (has("bun.lock") || has("bun.lockb")) return "bun run";
  if (has("pnpm-lock.yaml")) return "pnpm";
  if (has("yarn.lock")) return "yarn";
  return "npm run";
}

function packageCommands(): string[] {
  const packageJson = readJson<PackageJson>(join(root, "package.json"));
  if (!packageJson?.scripts) return [];

  const runner = commandFromPackageManager();
  const preferred = [
    "check",
    "lint:fix",
    "lint",
    "format:check",
    "typecheck",
    "test",
    "test:ci",
  ];

  return preferred
    .filter((name) => packageJson.scripts?.[name])
    .filter((name) => !/build/i.test(name))
    .map((name) => `${runner} ${name}`);
}

function composerCommands(): string[] {
  const composerJson = readJson<ComposerJson>(join(root, "composer.json"));
  if (!composerJson) return [];

  const deps = {
    ...composerJson.require,
    ...composerJson["require-dev"],
  };
  const scripts = composerJson.scripts ?? {};
  const commands: string[] = [];

  for (const name of ["check", "lint", "format", "test", "pint", "phpstan", "rector"]) {
    if (scripts[name]) commands.push(`composer ${name}`);
  }

  if (deps["laravel/framework"]) {
    if (deps["pestphp/pest"]) commands.push("ddev artisan test --parallel");
    else commands.push("ddev artisan test --parallel");
  } else if (deps["pestphp/pest"]) {
    commands.push("./vendor/bin/pest --parallel");
  } else if (deps["phpunit/phpunit"]) {
    commands.push("./vendor/bin/phpunit");
  }

  if (deps["larastan/larastan"] || has("phpstan.neon") || has("phpstan.neon.dist")) {
    commands.push("ddev exec ./vendor/bin/phpstan analyse");
  }

  return [...new Set(commands)];
}

function miscCommands(): string[] {
  const commands: string[] = [];

  if (has("mise.toml")) commands.push("mise run check");
  if (has("Makefile")) {
    const makefile = readFileSync(join(root, "Makefile"), "utf8");
    if (/^check:/m.test(makefile)) commands.push("make check");
    if (/^test:/m.test(makefile)) commands.push("make test");
  }
  if (has("pyproject.toml")) {
    commands.push("pytest");
    if (has("ruff.toml") || has(".ruff.toml")) commands.push("ruff check .");
  }

  return commands;
}

const allCommands = [...miscCommands(), ...packageCommands(), ...composerCommands()];
const preferred = allCommands.find((command) => /(?:^mise run check$|^make check$| check$)/.test(command));

console.log(`# Check discovery for ${basename(root)}`);
console.log(`Root: ${root}`);
printSection("Detected files", [
  "CHECKLIST.md",
  "mise.toml",
  "Makefile",
  "package.json",
  "composer.json",
  "pyproject.toml",
].filter(has));
printSection("Suggested commands", [...new Set(allCommands)]);

if (preferred) {
  console.log(`\nPrimary candidate: ${preferred}`);
}

if (has("CHECKLIST.md")) {
  console.log("\nCHECKLIST.md exists. Compare the suggestions above before changing it.");
} else {
  console.log("\nCHECKLIST.md is missing. Use the stable project-wide commands above as candidates.");
}
