#!/usr/bin/env bun

/**
 * Installer Script
 * Installs generated OpenCode files to user config
 *
 * Usage: bun src/init.ts [OPTIONS]
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { colors, print, printBox, printSeparator } from "./print";
import { ensureDirSync, ensureParentDirSync, copyDirSync, countInDir, type CopyMode } from "./fs";

// =============================================================================
// Constants
// =============================================================================

const REPO_URL = "https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git";
const TMP_DIR = `tmp_guidelines_${process.pid}`;
const HOME = process.env.HOME || "";
const ROOT_DIR = join(import.meta.dir, "..");
const LOCAL_MODE = process.argv.includes("--local") || process.argv.includes("-l");

// Destination paths
const PATHS = {
  rules: join(HOME, ".config/opencode/AGENTS.md"),
  skills: join(HOME, ".config/opencode/skill"),
  agents: join(HOME, ".config/opencode/agent"),
  plugins: join(HOME, ".config/opencode/plugin"),
  commands: join(HOME, ".config/opencode/command"),
  zsh: join(HOME, ".config/zsh-sync/custom.zsh"),
  opencodeConfig: join(HOME, ".config/opencode/opencode.json"),
};

// =============================================================================
// Copy Task System
// =============================================================================

interface CopyTask {
  name: string;
  src: string;
  dest: string;
  mode: CopyMode;
  extensions?: string[];
  countType: "file" | "dir";
}

function getSourceDir(): string {
  return LOCAL_MODE ? ROOT_DIR : TMP_DIR;
}

function buildCopyTasks(): CopyTask[] {
  const sourceDir = getSourceDir();
  const opencodeDir = join(sourceDir, "output", "opencode");

  return [
    {
      name: "skills",
      src: join(opencodeDir, "skills"),
      dest: PATHS.skills,
      mode: "clean",
      countType: "dir",
    },
    {
      name: "agents",
      src: join(opencodeDir, "agents"),
      dest: PATHS.agents,
      mode: "clean",
      extensions: [".md"],
      countType: "file",
    },
    {
      name: "plugins",
      src: join(opencodeDir, "plugin"),
      dest: PATHS.plugins,
      mode: "merge",
      extensions: [".ts", ".js"],
      countType: "file",
    },
    {
      name: "commands",
      src: join(opencodeDir, "command"),
      dest: PATHS.commands,
      mode: "merge",
      extensions: [".md"],
      countType: "file",
    },
  ];
}

function executeCopyTask(task: CopyTask): void {
  print.info(`Copying ${task.name} to ${task.dest}...`);

  if (!existsSync(task.src)) {
    print.error(`${task.name} folder not found`);
    return;
  }

  const count = copyDirSync({
    src: task.src,
    dest: task.dest,
    mode: task.mode,
    extensions: task.extensions,
  });

  print.success(`Copied ${count} ${task.name}`);
}

// =============================================================================
// Individual Operations
// =============================================================================

function cloneRepository(): void {
  if (LOCAL_MODE) {
    print.info("Using local output directory...");
    const outputDir = join(ROOT_DIR, "output", "opencode");
    if (!existsSync(outputDir)) {
      print.error("Local output not found. Run 'bun src/generate.ts' first.");
      process.exit(1);
    }
    print.success("Local output directory found");
    return;
  }

  print.info("Cloning repository...");

  const folders = [
    "content/base-rules.md",
    "output/opencode/skills",
    "output/opencode/agents",
    "output/opencode/plugin",
    "output/opencode/command",
    "output/opencode/opencode-config.json",
    "shell/zsh-custom.zsh",
  ];

  try {
    execSync(`git clone --depth=1 --filter=blob:none --sparse "${REPO_URL}" "${TMP_DIR}"`, { stdio: "pipe" });
    execSync(`git sparse-checkout set --no-cone ${folders.join(" ")}`, { cwd: TMP_DIR, stdio: "pipe" });
    print.success("Repository cloned successfully");
  } catch {
    print.error("Failed to clone repository");
    process.exit(1);
  }
}

function copyRules(): void {
  print.info(`Copying rules to ${PATHS.rules}...`);

  const sourceFile = join(getSourceDir(), "content", "base-rules.md");
  if (!existsSync(sourceFile)) {
    print.error("Base rules file not found");
    return;
  }

  ensureParentDirSync(PATHS.rules);
  copyFileSync(sourceFile, PATHS.rules);
  print.success(`Rules copied to ${PATHS.rules}`);
}

function copyZsh(): void {
  print.info(`Copying zsh config to ${PATHS.zsh}...`);

  const sourceFile = join(getSourceDir(), "shell", "zsh-custom.zsh");
  if (!existsSync(sourceFile)) {
    print.error("zsh-custom.zsh not found");
    return;
  }

  ensureParentDirSync(PATHS.zsh);
  copyFileSync(sourceFile, PATHS.zsh);
  print.success(`Zsh config copied`);
}

function mergeOpencodeConfig(): void {
  print.info(`Merging opencode config into ${PATHS.opencodeConfig}...`);

  const sourceFile = join(getSourceDir(), "output", "opencode", "opencode-config.json");
  if (!existsSync(sourceFile)) {
    print.error("opencode-config.json not found (run 'bun src/generate.ts' first)");
    return;
  }

  let settings: Record<string, unknown>;
  try {
    // Replace <home> placeholder with actual home directory
    const configContent = readFileSync(sourceFile, "utf-8").replace(/<home>/g, HOME);
    settings = JSON.parse(configContent);
  } catch {
    print.error("Failed to parse opencode-config.json");
    return;
  }

  ensureParentDirSync(PATHS.opencodeConfig);

  let existingConfig: Record<string, unknown> = {};
  if (existsSync(PATHS.opencodeConfig)) {
    try {
      existingConfig = JSON.parse(readFileSync(PATHS.opencodeConfig, "utf-8"));
    } catch {
      print.warning("Failed to parse existing config, creating new file");
    }
  }

  const merged = {
    ...existingConfig,
    model: settings.model,
    small_model: settings.small_model,
    permission: {
      ...(existingConfig.permission as Record<string, unknown> || {}),
      ...(settings.permission as Record<string, unknown> || {}),
    },
    agent: {
      ...(existingConfig.agent as Record<string, unknown> || {}),
      ...(settings.agent as Record<string, unknown> || {}),
    },
    mcp: {
      ...(existingConfig.mcp as Record<string, unknown> || {}),
      ...(settings.mcp as Record<string, unknown> || {}),
    },
  };

  writeFileSync(PATHS.opencodeConfig, JSON.stringify(merged, null, 2) + "\n");
  print.success(`OpenCode config merged`);
}

function cleanup(): void {
  if (!LOCAL_MODE && existsSync(TMP_DIR)) {
    const { rmSync } = require("fs");
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

// =============================================================================
// Main
// =============================================================================

function showUsage(): never {
  console.log(`
${colors.blue("+=============================================================+")}
${colors.blue("|   AI Concise Guidelines - OpenCode Installer                |")}
${colors.blue("+=============================================================+")}

Usage: bun src/init.ts [OPTIONS]

Options:
  --help, -h     Show this help message
  --local, -l    Use local output directory instead of cloning from GitHub

Installs to:
  - Rules:          ${PATHS.rules}
  - Skills:         ${PATHS.skills}
  - Agents:         ${PATHS.agents}
  - Plugins:        ${PATHS.plugins}
  - Commands:       ${PATHS.commands}
  - Zsh:            ${PATHS.zsh}
  - OpenCode Config: ${PATHS.opencodeConfig}
`);
  process.exit(0);
}

function main() {
  // Check for help flag
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showUsage();
  }

  // Register cleanup
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(1); });
  process.on("SIGTERM", () => { cleanup(); process.exit(1); });

  // Show header
  const modeLabel = LOCAL_MODE ? colors.yellow("(local)") : colors.green("(remote)");
  console.log();
  printBox("AI Concise Guidelines - OpenCode Installer");
  console.log();
  printSeparator();
  console.log(colors.blue(`Installing from: ${modeLabel}`));
  console.log(`  - Rules:           ${PATHS.rules}`);
  console.log(`  - Skills:          ${PATHS.skills} (clean sync)`);
  console.log(`  - Agents:          ${PATHS.agents} (clean sync)`);
  console.log(`  - Plugins:         ${PATHS.plugins} (merge)`);
  console.log(`  - Commands:        ${PATHS.commands} (merge)`);
  console.log(`  - Zsh:             ${PATHS.zsh}`);
  console.log(`  - OpenCode Config: ${PATHS.opencodeConfig} (merge)`);
  printSeparator();
  console.log();

  // Execute installation
  cloneRepository();
  copyRules();

  // Execute data-driven copy tasks
  const tasks = buildCopyTasks();
  for (const task of tasks) {
    executeCopyTask(task);
  }

  copyZsh();
  mergeOpencodeConfig();

  console.log();
  printBox("Installation completed successfully!", "green");
  console.log();
}

main();
