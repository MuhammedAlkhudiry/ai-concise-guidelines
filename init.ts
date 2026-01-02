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
  configPath?: string;
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
  --config-path PATH        Merge OpenCode config into PATH file (opencode.json)

  --rules-file-action ACTION
      Action when rules file exists: overwrite, append, or skip (default: skip)

  --help, -h                Show this help message

Example:
  bun init.ts --rules-path ~/.config/opencode/AGENTS.md \\
     --skills-path ~/.config/opencode/skill \\
     --agents-path ~/.config/opencode/agent \\
     --config-path ~/.config/opencode/opencode.json
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

// Deep merge objects
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Merge OpenCode config
function mergeConfig(dest: string): void {
  print.info(`Merging config into ${dest}...`);

  ensureParentDir(dest);

  const configFile = join(TMP_DIR, "output", "opencode", "opencode.json");

  if (!existsSync(configFile)) {
    print.error("OpenCode config file not found");
    return;
  }

  const newConfig = JSON.parse(readFileSync(configFile, "utf-8"));

  let result: any;
  if (existsSync(dest)) {
    const content = readFileSync(dest, "utf-8").trim();
    const existing = content ? JSON.parse(content) : {};
    // New config overrides user config, but preserve user's extra keys not in new config
    result = deepMerge(existing, newConfig);
    // Ensure our config keys completely override (not deep merge) for these specific keys
    for (const key of Object.keys(newConfig)) {
      result[key] = newConfig[key];
    }
  } else {
    result = newConfig;
  }

  writeFileSync(dest, JSON.stringify(result, null, 2) + "\n");
  print.success(`Config merged to ${dest}`);
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
      case "--config-path":
        opts.configPath = expandPath(next);
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
  if (!opts.rulesPath && !opts.skillsPath && !opts.agentsPath && !opts.configPath) {
    print.error("No destination specified. At least one path is required.");
    showUsage();
  }

  // Determine folders to clone
  const folders: string[] = [];

  if (opts.rulesPath) folders.push("content/base-rules.md");
  if (opts.skillsPath) folders.push("output/opencode/skills");
  if (opts.agentsPath) folders.push("output/opencode/agents");
  if (opts.configPath) folders.push("output/opencode/opencode.json");

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
${opts.configPath ? `  • Config: ${opts.configPath} (merge)` : ""}
${colors.yellow("═══════════════════════════════════════════════════════════")}
`);

  // Execute installation
  cloneRepository(folders);

  if (opts.rulesPath) copyRules(opts.rulesPath, opts.rulesAction);
  if (opts.skillsPath) copySkills(opts.skillsPath);
  if (opts.agentsPath) copyAgents(opts.agentsPath);
  if (opts.configPath) mergeConfig(opts.configPath);

  console.log(`
${colors.green("╔═══════════════════════════════════════════════════════════╗")}
${colors.green("║           ✓ Installation completed successfully!         ║")}
${colors.green("╚═══════════════════════════════════════════════════════════╝")}
`);
}

main();
