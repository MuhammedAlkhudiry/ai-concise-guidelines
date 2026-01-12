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

// Cleanup
function cleanup() {
  if (existsSync(TMP_DIR)) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });
process.on("SIGTERM", () => { cleanup(); process.exit(1); });

// Types
type RulesAction = "overwrite" | "append" | "skip";

interface Options {
  rulesPath?: string;
  rulesAction?: RulesAction;
  skillsPath?: string;
  agentsPath?: string;
  pluginPath?: string;
  commandPath?: string;
  zshPath?: string;
}

// Show usage
function showUsage(): never {
  console.log(`
${colors.blue("╔═══════════════════════════════════════════════════════════╗")}
${colors.blue("║   AI Concise Guidelines - OpenCode Installer              ║")}
${colors.blue("╚═══════════════════════════════════════════════════════════╝")}

Usage: bun init.ts [OPTIONS]

Options:
  --rules-path PATH         Copy base rules to PATH file
  --skills-path PATH        Copy skills to PATH directory (deletes existing first)
  --agents-path PATH        Copy agents to PATH directory (deletes existing first)
  --plugin-path PATH        Copy plugins to PATH directory
  --command-path PATH       Copy commands to PATH directory
  --zsh-path PATH           Copy zsh-custom.zsh to PATH file (always overwrites)

  --rules-file-action ACTION
      Action when rules file exists: overwrite, append, or skip (default: skip)

  --help, -h                Show this help message

Example:
  bun init.ts --rules-path ~/.config/opencode/AGENTS.md \\
     --skills-path ~/.config/opencode/skill \\
     --agents-path ~/.config/opencode/agent \\
     --plugin-path ~/.config/opencode/plugin \\
     --command-path ~/.config/opencode/command \\
     --zsh-path ~/.config/zsh-sync/custom.zsh
`);
  process.exit(0);
}

// Expand ~ to home directory
function expandPath(path: string): string {
  if (path.startsWith("~")) {
    return path.replace("~", process.env.HOME || "");
  }
  return path;
}

// Ensure parent directory exists
function ensureParentDir(path: string): void {
  const parent = dirname(path);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }
}

// Clone repository with sparse checkout
function cloneRepository(folders: string[]): void {
  print.info("Cloning repository...");

  try {
    execSync(`git clone --depth=1 --filter=blob:none --sparse "${REPO_URL}" "${TMP_DIR}"`, { stdio: "pipe" });
    execSync(`git sparse-checkout set --no-cone ${folders.join(" ")}`, { cwd: TMP_DIR, stdio: "pipe" });
    print.success("Repository cloned successfully");
  } catch (e) {
    print.error("Failed to clone repository");
    process.exit(1);
  }
}

// Copy rules (base-rules.md)
function copyRules(dest: string, action: RulesAction = "skip"): void {
  print.info(`Copying rules to ${dest}...`);

  const sourceFile = join(TMP_DIR, "content", "base-rules.md");
  if (!existsSync(sourceFile)) {
    print.error("Base rules file not found");
    return;
  }

  ensureParentDir(dest);

  if (existsSync(dest)) {
    print.warning(`File ${dest} already exists.`);
    if (action === "skip") {
      print.info("Skipping rules copy");
      return;
    }
    if (action === "append") {
      const existing = readFileSync(dest, "utf-8");
      const newContent = readFileSync(sourceFile, "utf-8");
      writeFileSync(dest, existing + `\n\n# --- Appended ${new Date().toISOString()} ---\n\n` + newContent);
      print.success(`Rules appended to ${dest}`);
      return;
    }
    // overwrite - fall through
  }

  copyFileSync(sourceFile, dest);
  print.success(`Rules copied to ${dest}`);
}

// Copy directory (delete first for clean sync)
function copyDirClean(src: string, dest: string): void {
  if (!existsSync(src)) return;
  
  // Delete existing directory first (clean sync)
  if (existsSync(dest)) {
    print.info(`Removing existing ${dest} for clean sync...`);
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
function copySkills(dest: string): void {
  print.info(`Copying skills to ${dest}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "skills");
  if (!existsSync(sourceDir)) {
    print.error("Skills folder not found");
    return;
  }

  copyDirClean(sourceDir, dest);

  const count = readdirSync(dest).filter(f => 
    statSync(join(dest, f)).isDirectory()
  ).length;
  print.success(`Copied ${count} skill directories to ${dest}`);
}

// Copy agents
function copyAgents(dest: string): void {
  print.info(`Copying agents to ${dest}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "agents");
  if (!existsSync(sourceDir)) {
    print.error("Agents folder not found");
    return;
  }

  copyDirClean(sourceDir, dest);

  const count = readdirSync(dest).filter(f => f.endsWith(".md")).length;
  print.success(`Copied ${count} agent files to ${dest}`);
}

// Copy plugins (individual .ts/.js files)
function copyPlugins(dest: string): void {
  print.info(`Copying plugins to ${dest}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "plugin");
  if (!existsSync(sourceDir)) {
    print.error("Plugin folder not found");
    return;
  }

  // Ensure destination exists
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  // Copy individual plugin files (don't delete existing - merge)
  const entries = readdirSync(sourceDir);
  let count = 0;
  for (const entry of entries) {
    const srcPath = join(sourceDir, entry);
    const destPath = join(dest, entry);
    
    if (statSync(srcPath).isFile() && (entry.endsWith(".ts") || entry.endsWith(".js"))) {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }
  
  print.success(`Copied ${count} plugin file(s) to ${dest}`);
}

// Copy commands (individual .md files)
function copyCommands(dest: string): void {
  print.info(`Copying commands to ${dest}...`);

  const sourceDir = join(TMP_DIR, "output", "opencode", "command");
  if (!existsSync(sourceDir)) {
    print.error("Command folder not found");
    return;
  }

  // Ensure destination exists
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  // Copy individual command files
  const entries = readdirSync(sourceDir);
  let count = 0;
  for (const entry of entries) {
    const srcPath = join(sourceDir, entry);
    const destPath = join(dest, entry);
    
    if (statSync(srcPath).isFile() && entry.endsWith(".md")) {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }
  
  print.success(`Copied ${count} command file(s) to ${dest}`);
}

// Copy zsh config
function copyZsh(dest: string): void {
  print.info(`Copying zsh config to ${dest}...`);

  const sourceFile = join(TMP_DIR, "shell", "zsh-custom.zsh");
  if (!existsSync(sourceFile)) {
    print.error("zsh-custom.zsh not found");
    return;
  }

  ensureParentDir(dest);
  copyFileSync(sourceFile, dest);
  print.success(`Zsh config copied to ${dest}`);
}

// Parse arguments
function parseArgs(): Options {
  const args = process.argv.slice(2);
  const opts: Options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--rules-path":
        opts.rulesPath = expandPath(next);
        i++;
        break;
      case "--rules-file-action":
        opts.rulesAction = next as RulesAction;
        i++;
        break;
      case "--skills-path":
        opts.skillsPath = expandPath(next);
        i++;
        break;
      case "--agents-path":
        opts.agentsPath = expandPath(next);
        i++;
        break;
      case "--plugin-path":
        opts.pluginPath = expandPath(next);
        i++;
        break;
      case "--command-path":
        opts.commandPath = expandPath(next);
        i++;
        break;
      case "--zsh-path":
        opts.zshPath = expandPath(next);
        i++;
        break;

      case "--help":
      case "-h":
        showUsage();
        break;
      default:
        print.error(`Unknown option: ${arg}`);
        showUsage();
    }
  }

  return opts;
}

// Main
function main() {
  const opts = parseArgs();

  // Validate at least one destination specified
  if (!opts.rulesPath && !opts.skillsPath && !opts.agentsPath && !opts.pluginPath && !opts.commandPath && !opts.zshPath) {
    print.error("No destination specified. At least one path is required.");
    showUsage();
  }

  // Determine folders to clone
  const folders: string[] = [];

  if (opts.rulesPath) folders.push("content/base-rules.md");
  if (opts.skillsPath) folders.push("output/opencode/skills");
  if (opts.agentsPath) folders.push("output/opencode/agents");
  if (opts.pluginPath) folders.push("output/opencode/plugin");
  if (opts.commandPath) folders.push("output/opencode/command");
  if (opts.zshPath) folders.push("shell/zsh-custom.zsh");

  // Show summary
  console.log(`
${colors.blue("╔═══════════════════════════════════════════════════════════╗")}
${colors.blue("║   AI Concise Guidelines - OpenCode Installer              ║")}
${colors.blue("╚═══════════════════════════════════════════════════════════╝")}

${colors.yellow("═══════════════════════════════════════════════════════════")}
${colors.blue("Installation Summary:")}
${opts.rulesPath ? `  • Rules: ${opts.rulesPath}` : ""}
${opts.skillsPath ? `  • Skills: ${opts.skillsPath} (clean sync)` : ""}
${opts.agentsPath ? `  • Agents: ${opts.agentsPath} (clean sync)` : ""}
${opts.pluginPath ? `  • Plugins: ${opts.pluginPath}` : ""}
${opts.commandPath ? `  • Commands: ${opts.commandPath}` : ""}
${opts.zshPath ? `  • Zsh: ${opts.zshPath}` : ""}
${colors.yellow("═══════════════════════════════════════════════════════════")}
`);

  // Execute installation
  cloneRepository(folders);

  if (opts.rulesPath) copyRules(opts.rulesPath, opts.rulesAction);
  if (opts.skillsPath) copySkills(opts.skillsPath);
  if (opts.agentsPath) copyAgents(opts.agentsPath);
  if (opts.pluginPath) copyPlugins(opts.pluginPath);
  if (opts.commandPath) copyCommands(opts.commandPath);
  if (opts.zshPath) copyZsh(opts.zshPath);

  console.log(`
${colors.green("╔═══════════════════════════════════════════════════════════╗")}
${colors.green("║           ✓ Installation completed successfully!         ║")}
${colors.green("╚═══════════════════════════════════════════════════════════╝")}
`);
}

main();
