#!/usr/bin/env bun

/**
 * Installer Script
 * Installs generated files for OpenCode, Claude Code, and Codex
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

const CODEX_PATHS = {
  rules: join(HOME, ".codex/AGENTS.md"),
  config: join(HOME, ".codex/config.toml"),
};

const CURSOR_PATHS = {
  settings: join(HOME, "Library/Application Support/Cursor/User/settings.json"),
  keybindings: join(HOME, "Library/Application Support/Cursor/User/keybindings.json"),
  mcp: join(HOME, ".cursor/mcp.json"),
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
    const codexOutputDir = join(ROOT_DIR, "output", "codex");
    const cursorOutputDir = join(ROOT_DIR, "output", "cursor");
    if (!existsSync(opencodeOutputDir) || !existsSync(claudeOutputDir) || !existsSync(codexOutputDir) || !existsSync(cursorOutputDir)) {
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
    "output/codex/mcp-servers.toml",
    "output/cursor/mcp.json",
    "cursor/settings.json",
    "cursor/keybindings.json",
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

function copyCodexRules(): void {
  print.info(`Copying Codex rules to ${CODEX_PATHS.rules}...`);

  const sourceFile = join(getSourceDir(), "content", "base-rules.md");
  if (!existsSync(sourceFile)) {
    print.error("Base rules file not found");
    return;
  }

  ensureParentDirSync(CODEX_PATHS.rules);
  copyFileSync(sourceFile, CODEX_PATHS.rules);
  print.success(`Codex rules copied`);
}

function getManagedMcpServerNames(managedContent: string): Set<string> {
  return new Set(
    Array.from(managedContent.matchAll(/^\[mcp_servers\.([^\]]+)\]\s*$/gm), ([, name]) => name)
  );
}

function removeManagedMcpServers(configToml: string, managedServerNames: Set<string>): string {
  if (managedServerNames.size === 0) {
    return configToml;
  }

  const lines = configToml.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const sectionMatch = lines[i].match(/^\[mcp_servers\.([^\]]+)\]\s*$/);
    if (!sectionMatch || !managedServerNames.has(sectionMatch[1])) {
      cleanedLines.push(lines[i]);
      continue;
    }

    while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === "") {
      cleanedLines.pop();
    }

    i++;
    while (i < lines.length && !/^\[[^\]]+\]\s*$/.test(lines[i])) {
      i++;
    }
    i--;
  }

  return cleanedLines.join("\n");
}

function mergeCodexMcpConfig(): void {
  print.info(`Merging Codex MCP config into ${CODEX_PATHS.config}...`);

  const sourceFile = join(getSourceDir(), "output", "codex", "mcp-servers.toml");
  if (!existsSync(sourceFile)) {
    print.error("mcp-servers.toml not found (run 'bun src/generate.ts' first)");
    return;
  }

  const managedContent = readFileSync(sourceFile, "utf-8").trimEnd();
  const startMarker = "# >>> ai-concise-guidelines mcp >>>";
  const endMarker = "# <<< ai-concise-guidelines mcp <<<";
  const managedBlock = `${startMarker}\n${managedContent}\n${endMarker}\n`;

  ensureParentDirSync(CODEX_PATHS.config);

  const existing = existsSync(CODEX_PATHS.config)
    ? readFileSync(CODEX_PATHS.config, "utf-8")
    : "";

  const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const managedPattern = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, "g");
  const orphanMarkerPattern = new RegExp(`^(${escapedStart}|${escapedEnd})\\s*$\\n?`, "gm");

  const withoutManagedBlock = existing.replace(managedPattern, "").replace(orphanMarkerPattern, "");
  const cleaned = removeManagedMcpServers(
    withoutManagedBlock,
    getManagedMcpServerNames(managedContent)
  ).trimEnd();
  const merged = cleaned.length > 0 ? `${cleaned}\n\n${managedBlock}` : managedBlock;

  writeFileSync(CODEX_PATHS.config, merged);
  print.success("Codex MCP config merged");
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

function copyCursorSettings(): void {
  print.info(`Copying Cursor settings to ${CURSOR_PATHS.settings}...`);

  const sourceFile = join(getSourceDir(), "cursor", "settings.json");
  if (!existsSync(sourceFile)) {
    print.error("cursor/settings.json not found");
    return;
  }

  let settings: Record<string, unknown>;
  try {
    const configContent = readFileSync(sourceFile, "utf-8").replace(/<home>/g, HOME);
    settings = JSON.parse(configContent);
  } catch {
    print.error("Failed to parse cursor/settings.json");
    return;
  }

  ensureParentDirSync(CURSOR_PATHS.settings);

  let existingConfig: Record<string, unknown> = {};
  if (existsSync(CURSOR_PATHS.settings)) {
    try {
      existingConfig = JSON.parse(readFileSync(CURSOR_PATHS.settings, "utf-8"));
    } catch {
      print.warning("Failed to parse existing Cursor settings, creating new file");
    }
  }

  const merged = { ...existingConfig, ...settings };
  writeFileSync(CURSOR_PATHS.settings, JSON.stringify(merged, null, 2) + "\n");
  print.success(`Cursor settings copied`);
}

function copyCursorKeybindings(): void {
  print.info(`Copying Cursor keybindings to ${CURSOR_PATHS.keybindings}...`);

  const sourceFile = join(getSourceDir(), "cursor", "keybindings.json");
  if (!existsSync(sourceFile)) {
    print.error("cursor/keybindings.json not found");
    return;
  }

  ensureParentDirSync(CURSOR_PATHS.keybindings);
  copyFileSync(sourceFile, CURSOR_PATHS.keybindings);
  print.success(`Cursor keybindings copied`);
}

function mergeCursorMcpConfig(): void {
  print.info(`Merging Cursor MCP config into ${CURSOR_PATHS.mcp}...`);

  const sourceFile = join(getSourceDir(), "output", "cursor", "mcp.json");
  if (!existsSync(sourceFile)) {
    print.error("output/cursor/mcp.json not found (run 'bun src/generate.ts' first)");
    return;
  }

  let managedConfig: { mcpServers?: Record<string, unknown> };
  try {
    managedConfig = JSON.parse(readFileSync(sourceFile, "utf-8"));
  } catch {
    print.error("Failed to parse output/cursor/mcp.json");
    return;
  }

  ensureParentDirSync(CURSOR_PATHS.mcp);

  let existingConfig: { mcpServers?: Record<string, unknown> } = {};
  if (existsSync(CURSOR_PATHS.mcp)) {
    try {
      existingConfig = JSON.parse(readFileSync(CURSOR_PATHS.mcp, "utf-8"));
    } catch {
      print.warning("Failed to parse existing Cursor MCP config, creating new file");
    }
  }

  const managedServers = managedConfig.mcpServers || {};
  const existingServers = existingConfig.mcpServers || {};
  const mergedServers = { ...existingServers, ...managedServers };

  const merged = { ...existingConfig, mcpServers: mergedServers };
  writeFileSync(CURSOR_PATHS.mcp, JSON.stringify(merged, null, 2) + "\n");
  print.success("Cursor MCP config merged");
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
${colors.blue("|   Supports: OpenCode + Claude Code + Codex + Cursor         |")}
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

  ${colors.blue("Codex:")}
    Rules:    ${CODEX_PATHS.rules}
    Config:   ${CODEX_PATHS.config}

  ${colors.cyan("Cursor:")}
    Settings:    ${CURSOR_PATHS.settings}
    Keybindings: ${CURSOR_PATHS.keybindings}
    MCP:         ${CURSOR_PATHS.mcp}

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
  console.log(colors.blue("  Codex:"));
  console.log(`    Rules:    ${CODEX_PATHS.rules}`);
  console.log(`    Config:   ${CODEX_PATHS.config} (managed block merge)`);
  console.log();
  console.log(colors.cyan("  Cursor:"));
  console.log(`    Settings:    ${CURSOR_PATHS.settings} (merge)`);
  console.log(`    Keybindings: ${CURSOR_PATHS.keybindings}`);
  console.log(`    MCP:         ${CURSOR_PATHS.mcp} (merge)`);
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

  // Codex installation
  console.log();
  console.log(colors.blue("Installing Codex..."));
  copyCodexRules();
  mergeCodexMcpConfig();

  // Cursor installation
  console.log();
  console.log(colors.cyan("Installing Cursor..."));
  copyCursorSettings();
  copyCursorKeybindings();
  mergeCursorMcpConfig();

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
