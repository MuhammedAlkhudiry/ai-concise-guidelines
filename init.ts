#!/usr/bin/env bun

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, statSync } from "fs";
import { dirname, join } from "path";
import { execSync } from "child_process";

// Colors for output
const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
};

const print = {
  error: (msg: string) => console.error(colors.red(`ERROR: ${msg}`)),
  success: (msg: string) => console.log(colors.green(msg)),
  info: (msg: string) => console.log(colors.blue(msg)),
  warning: (msg: string) => console.log(colors.yellow(msg)),
};

// Constants
const REPO_URL = "https://github.com/MuhammedAlkhudiry/ai-concise-guidelines.git";
const TMP_DIR = `tmp_guidelines_${process.pid}`;
const HOME = process.env.HOME || "";

// Hardcoded OpenCode paths
const PATHS = {
  rules: join(HOME, ".config/opencode/AGENTS.md"),
  skills: join(HOME, ".config/opencode/skill"),
  agents: join(HOME, ".config/opencode/agent"),
  plugins: join(HOME, ".config/opencode/plugin"),
  commands: join(HOME, ".config/opencode/command"),
  zsh: join(HOME, ".config/zsh-sync/custom.zsh"),
  opencodeConfig: join(HOME, ".config/opencode/opencode.json"),
};

// Cleanup
function cleanup() {
  if (existsSync(TMP_DIR)) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });
process.on("SIGTERM", () => { cleanup(); process.exit(1); });

// Show usage
function showUsage(): never {
  console.log(`
${colors.blue("╔═══════════════════════════════════════════════════════════╗")}
${colors.blue("║   AI Concise Guidelines - OpenCode Installer              ║")}
${colors.blue("╚═══════════════════════════════════════════════════════════╝")}

Usage: bun init.ts [OPTIONS]

Options:
  --help, -h    Show this help message

Installs to:
  • Rules:          ${PATHS.rules}
  • Skills:         ${PATHS.skills}
  • Agents:         ${PATHS.agents}
  • Plugins:        ${PATHS.plugins}
  • Commands:       ${PATHS.commands}
  • Zsh:            ${PATHS.zsh}
  • OpenCode Config: ${PATHS.opencodeConfig}
`);
  process.exit(0);
}

// Ensure parent directory exists
function ensureParentDir(path: string): void {
  const parent = dirname(path);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }
}

// Clone repository with sparse checkout
function cloneRepository(): void {
  print.info("Cloning repository...");

  const folders = [
    "content/base-rules.md",
    "output/opencode/skills",
    "output/opencode/agents",
    "output/opencode/plugin",
    "output/opencode/command",
    "shell/zsh-custom.zsh",
    "custom-opencode.json",
  ];

  try {
    execSync(`git clone --depth=1 --filter=blob:none --sparse "${REPO_URL}" "${TMP_DIR}"`, { stdio: "pipe" });
    execSync(`git sparse-checkout set --no-cone ${folders.join(" ")}`, { cwd: TMP_DIR, stdio: "pipe" });
    print.success("Repository cloned successfully");
  } catch (e) {
    print.error("Failed to clone repository");
    process.exit(1);
  }
}

// Copy rules (base-rules.md) - always overwrite
function copyRules(): void {
  print.info(`Copying rules to ${PATHS.rules}...`);

  const sourceFile = join(TMP_DIR, "content", "base-rules.md");
  if (!existsSync(sourceFile)) {
    print.error("Base rules file not found");
    return;
  }

  ensureParentDir(PATHS.rules);
  copyFileSync(sourceFile, PATHS.rules);
  print.success(`Rules copied to ${PATHS.rules}`);
}

// Copy directory (delete first for clean sync)
function copyDirClean(src: string, dest: string): void {
  if (!existsSync(src)) return;
  
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirClean(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy skills
function copySkills(): void {
  print.info(`Copying skills to ${PATHS.skills}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "skills");
  if (!existsSync(sourceDir)) {
    print.error("Skills folder not found");
    return;
  }

  copyDirClean(sourceDir, PATHS.skills);

  const count = readdirSync(PATHS.skills).filter(f => 
    statSync(join(PATHS.skills, f)).isDirectory()
  ).length;
  print.success(`Copied ${count} skill directories`);
}

// Copy agents
function copyAgents(): void {
  print.info(`Copying agents to ${PATHS.agents}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "agents");
  if (!existsSync(sourceDir)) {
    print.error("Agents folder not found");
    return;
  }

  copyDirClean(sourceDir, PATHS.agents);

  const count = readdirSync(PATHS.agents).filter(f => f.endsWith(".md")).length;
  print.success(`Copied ${count} agent files`);
}

// Copy plugins (merge, don't delete existing)
function copyPlugins(): void {
  print.info(`Copying plugins to ${PATHS.plugins}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "plugin");
  if (!existsSync(sourceDir)) {
    print.error("Plugin folder not found");
    return;
  }

  if (!existsSync(PATHS.plugins)) {
    mkdirSync(PATHS.plugins, { recursive: true });
  }

  const entries = readdirSync(sourceDir);
  let count = 0;
  for (const entry of entries) {
    const srcPath = join(sourceDir, entry);
    const destPath = join(PATHS.plugins, entry);
    
    if (statSync(srcPath).isFile() && (entry.endsWith(".ts") || entry.endsWith(".js"))) {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }
  
  print.success(`Copied ${count} plugin file(s)`);
}

// Copy commands (merge, don't delete existing)
function copyCommands(): void {
  print.info(`Copying commands to ${PATHS.commands}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "command");
  if (!existsSync(sourceDir)) {
    print.error("Command folder not found");
    return;
  }

  if (!existsSync(PATHS.commands)) {
    mkdirSync(PATHS.commands, { recursive: true });
  }

  const entries = readdirSync(sourceDir);
  let count = 0;
  for (const entry of entries) {
    const srcPath = join(sourceDir, entry);
    const destPath = join(PATHS.commands, entry);
    
    if (statSync(srcPath).isFile() && entry.endsWith(".md")) {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }
  
  print.success(`Copied ${count} command file(s)`);
}

// Copy zsh config
function copyZsh(): void {
  print.info(`Copying zsh config to ${PATHS.zsh}...`);

  const sourceFile = join(TMP_DIR, "shell", "zsh-custom.zsh");
  if (!existsSync(sourceFile)) {
    print.error("zsh-custom.zsh not found");
    return;
  }

  ensureParentDir(PATHS.zsh);
  copyFileSync(sourceFile, PATHS.zsh);
  print.success(`Zsh config copied`);
}

// Merge opencode config settings from custom-opencode.json
function mergeOpencodeConfig(): void {
  print.info(`Merging opencode config into ${PATHS.opencodeConfig}...`);

  const sourceFile = join(TMP_DIR, "custom-opencode.json");
  if (!existsSync(sourceFile)) {
    print.error("custom-opencode.json not found");
    return;
  }

  // Read settings to merge
  let settings: Record<string, unknown>;
  try {
    settings = JSON.parse(readFileSync(sourceFile, "utf-8"));
  } catch (e) {
    print.error("Failed to parse custom-opencode.json");
    return;
  }

  ensureParentDir(PATHS.opencodeConfig);

  // Read existing config or start with empty object
  let existingConfig: Record<string, unknown> = {};
  if (existsSync(PATHS.opencodeConfig)) {
    try {
      existingConfig = JSON.parse(readFileSync(PATHS.opencodeConfig, "utf-8"));
    } catch (e) {
      print.warning("Failed to parse existing config, creating new file");
    }
  }

  // Merge settings (shallow merge for top-level, deep merge for nested)
  const merged = {
    ...existingConfig,
    model: settings.model,
    small_model: settings.small_model,
    agent: {
      ...(existingConfig.agent as Record<string, unknown> || {}),
      ...(settings.agent as Record<string, unknown> || {})
    },
    mcp: {
      ...(existingConfig.mcp as Record<string, unknown> || {}),
      ...(settings.mcp as Record<string, unknown> || {})
    }
  };

  writeFileSync(PATHS.opencodeConfig, JSON.stringify(merged, null, 2) + "\n");
  print.success(`OpenCode config merged`);
}

// Main
function main() {
  // Check for help flag
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showUsage();
  }

  // Show summary
  console.log(`
${colors.blue("╔═══════════════════════════════════════════════════════════╗")}
${colors.blue("║   AI Concise Guidelines - OpenCode Installer              ║")}
${colors.blue("╚═══════════════════════════════════════════════════════════╝")}

${colors.yellow("═══════════════════════════════════════════════════════════")}
${colors.blue("Installing to:")}
  • Rules:           ${PATHS.rules}
  • Skills:          ${PATHS.skills} (clean sync)
  • Agents:          ${PATHS.agents} (clean sync)
  • Plugins:         ${PATHS.plugins} (merge)
  • Commands:        ${PATHS.commands} (merge)
  • Zsh:             ${PATHS.zsh}
  • OpenCode Config: ${PATHS.opencodeConfig} (merge)
${colors.yellow("═══════════════════════════════════════════════════════════")}
`);

  // Execute installation
  cloneRepository();
  copyRules();
  copySkills();
  copyAgents();
  copyPlugins();
  copyCommands();
  copyZsh();
  mergeOpencodeConfig();

  console.log(`
${colors.green("╔═══════════════════════════════════════════════════════════╗")}
${colors.green("║           ✓ Installation completed successfully!         ║")}
${colors.green("╚═══════════════════════════════════════════════════════════╝")}
`);
}

main();
