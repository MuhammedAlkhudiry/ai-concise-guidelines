#!/usr/bin/env bun

/**
 * Installer Script
 * Installs generated files for both OpenCode and Claude Code
 *
 * Usage: bun src/init.ts [OPTIONS]
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { colors, print, printBox, printSeparator } from "./print";
import { ensureDirSync, ensureParentDirSync, copyDirSync, type CopyMode } from "./fs";

// =============================================================================
// Constants
// =============================================================================

const REPO_URL = "https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git";
const TMP_DIR = `tmp_guidelines_${process.pid}`;
const HOME = process.env.HOME || "";
const ROOT_DIR = join(import.meta.dir, "..");
const LOCAL_MODE = process.argv.includes("--local") || process.argv.includes("-l");

// =============================================================================
// Destination Paths
// =============================================================================

const OPENCODE_PATHS = {
  rules: join(HOME, ".config/opencode/AGENTS.md"),
  skills: join(HOME, ".agents/skills"),
  plugins: join(HOME, ".config/opencode/plugin"),
  config: join(HOME, ".config/opencode/opencode.json"),
};

const CLAUDE_PATHS = {
  rules: join(HOME, ".claude/CLAUDE.md"),
  skills: join(HOME, ".agents/skills"),
  settings: join(HOME, ".claude/settings.json"),
};

const SHARED_PATHS = {
  zsh: join(HOME, ".config/zsh-sync/custom.zsh"),
  kitty: join(HOME, ".config/kitty/kitty.conf"),
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

function buildOpencodeTasks(): CopyTask[] {
  const sourceDir = getSourceDir();
  const opencodeDir = join(sourceDir, "output", "opencode");

  return [
    {
      name: "skills",
      src: join(opencodeDir, "skills"),
      dest: OPENCODE_PATHS.skills,
      mode: "clean",
      countType: "dir",
    },
    {
      name: "plugins",
      src: join(opencodeDir, "plugin"),
      dest: OPENCODE_PATHS.plugins,
      mode: "merge",
      extensions: [".ts", ".js"],
      countType: "file",
    },
  ];
}

function buildClaudeTasks(): CopyTask[] {
  const sourceDir = getSourceDir();
  const claudeDir = join(sourceDir, "output", "claude");

  return [
    {
      name: "skills",
      src: join(claudeDir, "skills"),
      dest: CLAUDE_PATHS.skills,
      mode: "clean",
      countType: "dir",
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
    const opencodeOutputDir = join(ROOT_DIR, "output", "opencode");
    const claudeOutputDir = join(ROOT_DIR, "output", "claude");
    if (!existsSync(opencodeOutputDir) || !existsSync(claudeOutputDir)) {
      print.error("Local output not found. Run 'bun src/generate.ts' first.");
      process.exit(1);
    }
    print.success("Local output directories found");
    return;
  }

  print.info("Cloning repository...");

  const folders = [
    "content/base-rules.md",
    "output/opencode/skills",
    "output/opencode/plugin",
    "output/opencode/opencode-config.json",
    "output/claude/skills",
    "output/claude/settings.json",
    "shell/zsh-custom.zsh",
    "shell/kitty.conf",
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

function copyOpencodeRules(): void {
  print.info(`Copying OpenCode rules to ${OPENCODE_PATHS.rules}...`);

  const sourceFile = join(getSourceDir(), "content", "base-rules.md");
  if (!existsSync(sourceFile)) {
    print.error("Base rules file not found");
    return;
  }

  ensureParentDirSync(OPENCODE_PATHS.rules);
  copyFileSync(sourceFile, OPENCODE_PATHS.rules);
  print.success(`OpenCode rules copied`);
}

function copyClaudeRules(): void {
  print.info(`Copying Claude Code rules to ${CLAUDE_PATHS.rules}...`);

  const sourceFile = join(getSourceDir(), "content", "base-rules.md");
  if (!existsSync(sourceFile)) {
    print.error("Base rules file not found");
    return;
  }

  ensureParentDirSync(CLAUDE_PATHS.rules);
  copyFileSync(sourceFile, CLAUDE_PATHS.rules);
  print.success(`Claude Code rules copied`);
}

function copyZsh(): void {
  print.info(`Copying zsh config to ${SHARED_PATHS.zsh}...`);

  const sourceFile = join(getSourceDir(), "shell", "zsh-custom.zsh");
  if (!existsSync(sourceFile)) {
    print.error("zsh-custom.zsh not found");
    return;
  }

  ensureParentDirSync(SHARED_PATHS.zsh);
  copyFileSync(sourceFile, SHARED_PATHS.zsh);
  print.success(`Zsh config copied`);
}

function copyKitty(): void {
  print.info(`Copying kitty config to ${SHARED_PATHS.kitty}...`);

  const sourceFile = join(getSourceDir(), "shell", "kitty.conf");
  if (!existsSync(sourceFile)) {
    print.error("kitty.conf not found");
    return;
  }

  ensureParentDirSync(SHARED_PATHS.kitty);
  copyFileSync(sourceFile, SHARED_PATHS.kitty);
  print.success(`Kitty config copied`);
}

function mergeOpencodeConfig(): void {
  print.info(`Merging OpenCode config into ${OPENCODE_PATHS.config}...`);

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

  ensureParentDirSync(OPENCODE_PATHS.config);

  let existingConfig: Record<string, unknown> = {};
  if (existsSync(OPENCODE_PATHS.config)) {
    try {
      existingConfig = JSON.parse(readFileSync(OPENCODE_PATHS.config, "utf-8"));
    } catch {
      print.warning("Failed to parse existing config, creating new file");
    }
  }

  const merged = {
    ...existingConfig,
    model: settings.model,
    small_model: settings.small_model,
    keybinds: {
      ...(existingConfig.keybinds as Record<string, unknown> || {}),
      ...(settings.keybinds as Record<string, unknown> || {}),
    },
    permission: {
      ...(existingConfig.permission as Record<string, unknown> || {}),
      ...(settings.permission as Record<string, unknown> || {}),
    },
    agent: {
      ...(existingConfig.agent as Record<string, unknown> || {}),
      ...(settings.agent as Record<string, unknown> || {}),
    },
    // Overwrite (not merge) plugin and mcp to ensure clean state
    plugin: settings.plugin,
    mcp: settings.mcp,
  };

  writeFileSync(OPENCODE_PATHS.config, JSON.stringify(merged, null, 2) + "\n");
  print.success(`OpenCode config merged`);
}

function mergeClaudeSettings(): void {
  print.info(`Merging Claude Code settings into ${CLAUDE_PATHS.settings}...`);

  const sourceFile = join(getSourceDir(), "output", "claude", "settings.json");
  if (!existsSync(sourceFile)) {
    print.error("settings.json not found (run 'bun src/generate.ts' first)");
    return;
  }

  let settings: Record<string, unknown>;
  try {
    const configContent = readFileSync(sourceFile, "utf-8").replace(/<home>/g, HOME);
    settings = JSON.parse(configContent);
  } catch {
    print.error("Failed to parse settings.json");
    return;
  }

  ensureParentDirSync(CLAUDE_PATHS.settings);

  let existingConfig: Record<string, unknown> = {};
  if (existsSync(CLAUDE_PATHS.settings)) {
    try {
      existingConfig = JSON.parse(readFileSync(CLAUDE_PATHS.settings, "utf-8"));
    } catch {
      print.warning("Failed to parse existing settings, creating new file");
    }
  }

  // Merge permissions arrays
  const existingPermissions = existingConfig.permissions as Record<string, string[]> || {};
  const newPermissions = settings.permissions as Record<string, string[]> || {};

  const mergedPermissions: Record<string, string[]> = {};
  
  // Merge allow arrays
  if (existingPermissions.allow || newPermissions.allow) {
    mergedPermissions.allow = [
      ...new Set([
        ...(existingPermissions.allow || []),
        ...(newPermissions.allow || []),
      ]),
    ];
  }

  // Merge deny arrays
  if (existingPermissions.deny || newPermissions.deny) {
    mergedPermissions.deny = [
      ...new Set([
        ...(existingPermissions.deny || []),
        ...(newPermissions.deny || []),
      ]),
    ];
  }

  const merged = {
    ...existingConfig,
    ...settings,
  };

  if (Object.keys(mergedPermissions).length > 0) {
    merged.permissions = mergedPermissions;
  }

  writeFileSync(CLAUDE_PATHS.settings, JSON.stringify(merged, null, 2) + "\n");
  print.success(`Claude Code settings merged`);
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
${colors.blue("|   AI Concise Guidelines - Installer                         |")}
${colors.blue("|   Supports: OpenCode + Claude Code                          |")}
${colors.blue("+=============================================================+")}

Usage: bun src/init.ts [OPTIONS]

Options:
  --help, -h     Show this help message
  --local, -l    Use local output directory instead of cloning from GitHub

Installs to:

  ${colors.blue("OpenCode:")}
    Rules:    ${OPENCODE_PATHS.rules}
    Skills:   ${OPENCODE_PATHS.skills}
    Plugins:  ${OPENCODE_PATHS.plugins}
    Config:   ${OPENCODE_PATHS.config}

  ${colors.green("Claude Code:")}
    Rules:    ${CLAUDE_PATHS.rules}
    Skills:   ${CLAUDE_PATHS.skills}
    Settings: ${CLAUDE_PATHS.settings}

  ${colors.yellow("Shared:")}
    Zsh:      ${SHARED_PATHS.zsh}
    Kitty:    ${SHARED_PATHS.kitty}
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
  printBox("AI Concise Guidelines - Installer");
  console.log();
  printSeparator();
  console.log(colors.blue(`Installing from: ${modeLabel}`));
  console.log();
  console.log(colors.blue("  OpenCode:"));
  console.log(`    Rules:    ${OPENCODE_PATHS.rules}`);
  console.log(`    Skills:   ${OPENCODE_PATHS.skills} (clean)`);
  console.log(`    Plugins:  ${OPENCODE_PATHS.plugins} (merge)`);
  console.log(`    Config:   ${OPENCODE_PATHS.config} (merge)`);
  console.log();
  console.log(colors.green("  Claude Code:"));
  console.log(`    Rules:    ${CLAUDE_PATHS.rules}`);
  console.log(`    Skills:   ${CLAUDE_PATHS.skills} (clean)`);
  console.log(`    Settings: ${CLAUDE_PATHS.settings} (merge)`);
  console.log();
  console.log(colors.yellow("  Shared:"));
  console.log(`    Zsh:      ${SHARED_PATHS.zsh}`);
  console.log(`    Kitty:    ${SHARED_PATHS.kitty}`);
  printSeparator();
  console.log();

  // Execute installation
  cloneRepository();

  // OpenCode installation
  console.log();
  console.log(colors.blue("Installing OpenCode..."));
  copyOpencodeRules();
  const opencodeTasks = buildOpencodeTasks();
  for (const task of opencodeTasks) {
    executeCopyTask(task);
  }
  mergeOpencodeConfig();

  // Claude Code installation
  console.log();
  console.log(colors.green("Installing Claude Code..."));
  copyClaudeRules();
  const claudeTasks = buildClaudeTasks();
  for (const task of claudeTasks) {
    executeCopyTask(task);
  }
  mergeClaudeSettings();

  // Shared
  console.log();
  console.log(colors.yellow("Installing shared configs..."));
  copyZsh();
  copyKitty();

  console.log();
  printBox("Installation completed successfully!", "green");
  console.log();
}

main();
