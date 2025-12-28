#!/usr/bin/env bun

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, statSync } from "fs";
import { dirname, basename, join } from "path";
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
type Platform = "claude-code" | "opencode" | "windsurf";
type RulesAction = "overwrite" | "append" | "skip";

interface Options {
  rulesPath?: string;
  rulesAction?: RulesAction;
  skillsPath?: string;
  agentsPath?: string;
  workflowsPath?: string;
  workflowsPrefix?: string;
  zshPath?: string;
  mcpPath?: string;
  platform?: Platform;
  installStatusline?: boolean;
}

// Show usage
function showUsage(): never {
  console.log(`
${colors.blue("╔═══════════════════════════════════════════════════════════╗")}
${colors.blue("║   AI Concise Guidelines - Installer                      ║")}
${colors.blue("╚═══════════════════════════════════════════════════════════╝")}

Usage: bun init.ts [OPTIONS]

Options:
  --rules-path PATH         Merge guidelines into a single rules file at PATH
  --skills-path PATH        Copy skills to PATH directory
  --agents-path PATH        Copy agents to PATH directory
  --workflows-path PATH     Copy workflows to PATH directory (Windsurf only)
  --zsh-path PATH           Copy ZSH custom config to PATH and source it in ~/.zshrc
  --mcp-path PATH           Copy MCP config to PATH file

  --rules-file-action ACTION
      Action when rules file exists: overwrite, append, or skip (default: skip)

  --workflows-prefix PREFIX
      Add prefix to workflow filenames (e.g., "MODES: ")

  --install-statusline      Install Claude Code status line

  --platform PLATFORM       Hint for agent format: claude-code, opencode, windsurf
                            (auto-detected from paths if not specified)

  --help, -h                Show this help message

Examples:
  # Windsurf
  bun init.ts --rules-path ~/.windsurf/rules/RULES.md \\
     --workflows-path ~/.windsurf/workflows

  # Claude Code
  bun init.ts --rules-path ~/.claude/CLAUDE.md \\
     --skills-path ~/.claude/skills \\
     --agents-path ~/.claude/agents \\
     --mcp-path ~/.claude/mcp.json \\
     --install-statusline

  # OpenCode
  bun init.ts --rules-path ~/.config/opencode/AGENTS.md \\
     --skills-path ~/.config/opencode/skill \\
     --agents-path ~/.config/opencode/agent \\
     --mcp-path ~/.config/opencode/opencode.json
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

// Detect platform from paths
function detectPlatform(opts: Options): Platform {
  const allPaths = [opts.rulesPath, opts.skillsPath, opts.agentsPath, opts.workflowsPath, opts.mcpPath]
    .filter(Boolean)
    .join(" ");

  if (allPaths.includes("opencode")) return "opencode";
  if (allPaths.includes("windsurf") || allPaths.includes("codeium")) return "windsurf";
  if (allPaths.includes(".claude")) return "claude-code";
  return "claude-code";
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

// Copy rules (merged guidelines)
function copyRules(dest: string, action: RulesAction = "skip"): void {
  print.info(`Copying rules to ${dest}...`);

  const guidelinesDir = join(TMP_DIR, "guidelines");
  if (!existsSync(guidelinesDir)) {
    print.error("Guidelines folder not found");
    return;
  }

  ensureParentDir(dest);

  if (existsSync(dest)) {
    print.warning(`File ${dest} already exists.`);
    if (action === "skip") {
      print.info("Skipping rules copy");
      return;
    }
    if (action === "overwrite") {
      writeFileSync(dest, "");
    } else if (action === "append") {
      const existing = readFileSync(dest, "utf-8");
      writeFileSync(dest, existing + `\n\n# --- Appended ${new Date().toISOString()} ---\n`);
    }
  } else {
    writeFileSync(dest, "");
  }

  // Merge all markdown files
  const files = readdirSync(guidelinesDir)
    .filter(f => f.endsWith(".md"))
    .sort();

  for (const file of files) {
    const content = readFileSync(join(guidelinesDir, file), "utf-8");
    const existing = readFileSync(dest, "utf-8");
    writeFileSync(dest, existing + "\n\n" + content);
  }

  print.success(`Rules copied to ${dest}`);
}

// Copy directory recursively
function copyDirRecursive(src: string, dest: string): void {
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
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy skills
function copySkills(dest: string, platform: Platform): void {
  print.info(`Copying skills to ${dest}...`);

  let sourceDir = join(TMP_DIR, "integrations", platform, "skills");
  if (!existsSync(sourceDir)) {
    sourceDir = join(TMP_DIR, "integrations", "claude-code", "skills");
  }

  if (!existsSync(sourceDir)) {
    print.error("Skills folder not found");
    return;
  }

  copyDirRecursive(sourceDir, dest);

  const count = readdirSync(dest).filter(f => 
    statSync(join(dest, f)).isDirectory()
  ).length;
  print.success(`Copied ${count} skill directories to ${dest}`);
}

// Copy agents
function copyAgents(dest: string, platform: Platform): void {
  print.info(`Copying agents to ${dest}...`);

  const sourceDir = platform === "opencode"
    ? join(TMP_DIR, "integrations", "opencode", "agents")
    : join(TMP_DIR, "integrations", "claude-code", "sub-agents");

  if (!existsSync(sourceDir)) {
    print.error(`Agents folder not found at ${sourceDir}`);
    return;
  }

  copyDirRecursive(sourceDir, dest);

  const count = readdirSync(dest).filter(f => f.endsWith(".md")).length;
  print.success(`Copied ${count} agent files to ${dest}`);
}

// Copy workflows (Windsurf)
function copyWorkflows(dest: string, prefix?: string): void {
  print.info(`Copying workflows to ${dest}...`);

  const sourceDir = join(TMP_DIR, "integrations", "windsurf", "workflows");
  if (!existsSync(sourceDir)) {
    print.error("Workflows folder not found");
    return;
  }

  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dest, { recursive: true });

  const files = readdirSync(sourceDir).filter(f => f.endsWith(".md"));
  for (const file of files) {
    const destName = prefix ? `${prefix}${file}` : file;
    copyFileSync(join(sourceDir, file), join(dest, destName));
  }

  print.success(`Copied ${files.length} workflow files to ${dest}`);
}

// Copy ZSH custom config
function copyZsh(dest: string): void {
  print.info(`Copying ZSH custom config to ${dest}...`);

  const sourceFile = join(TMP_DIR, "shell", "zsh-custom.zsh");
  if (!existsSync(sourceFile)) {
    print.error("ZSH custom config not found");
    return;
  }

  ensureParentDir(dest);
  copyFileSync(sourceFile, dest);

  // Add source line to ~/.zshrc if not present
  const zshrc = join(process.env.HOME || "", ".zshrc");
  const sourceLine = `[ -f ${dest} ] && source ${dest}`;

  if (existsSync(zshrc)) {
    const content = readFileSync(zshrc, "utf-8");
    if (!content.includes(sourceLine)) {
      print.info(`Adding source line to ${zshrc}...`);
      writeFileSync(`${zshrc}.bak`, content);
      writeFileSync(zshrc, content + `\n\n# Synced custom config via ai-concise-guidelines\n${sourceLine}\n`);
      print.success(`Source line added to ${zshrc} (backup created)`);
    } else {
      print.info("Source line already exists in .zshrc");
    }
  } else {
    print.warning(`${zshrc} not found. Please manually add: ${sourceLine}`);
  }

  print.success(`ZSH custom config installed to ${dest}`);
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

// Merge MCP config
function mergeMcp(dest: string, platform: Platform): void {
  print.info(`Merging MCP servers into ${dest}...`);

  ensureParentDir(dest);

  if (platform === "opencode") {
    // OpenCode: merge opencode.json with mcp servers
    const mcpFile = join(TMP_DIR, "integrations", "opencode", "mcp.json");
    const configFile = join(TMP_DIR, "integrations", "opencode", "opencode.json");

    if (!existsSync(mcpFile)) {
      print.error("MCP source file not found");
      return;
    }

    const newMcps = JSON.parse(readFileSync(mcpFile, "utf-8"));
    const newConfig = existsSync(configFile)
      ? JSON.parse(readFileSync(configFile, "utf-8"))
      : { $schema: "https://opencode.ai/config.json" };

    let result: any;
    if (existsSync(dest)) {
      const content = readFileSync(dest, "utf-8").trim();
      const existing = content ? JSON.parse(content) : {};
      // Deep merge existing with new config, then add mcp servers
      result = deepMerge(existing, newConfig);
      result.mcp = { ...(existing.mcp || {}), ...newMcps };
    } else {
      result = { ...newConfig, mcp: newMcps };
    }

    writeFileSync(dest, JSON.stringify(result, null, 2) + "\n");
    const count = Object.keys(result.mcp || {}).length;
    print.success(`Merged MCP servers (total: ${count})`);

  } else {
    // Claude Code: merge mcp.json with mcpServers key
    const sourceFile = join(TMP_DIR, "integrations", "claude-code", "mcp.json");
    if (!existsSync(sourceFile)) {
      print.error("MCP source file not found");
      return;
    }

    const newConfig = JSON.parse(readFileSync(sourceFile, "utf-8"));
    const newMcps = newConfig.mcpServers || {};

    let result: any;
    if (existsSync(dest)) {
      const content = readFileSync(dest, "utf-8").trim();
      const existing = content ? JSON.parse(content) : {};
      result = {
        ...existing,
        mcpServers: { ...(existing.mcpServers || {}), ...newMcps },
      };
    } else {
      result = newConfig;
    }

    writeFileSync(dest, JSON.stringify(result, null, 2) + "\n");
    const count = Object.keys(result.mcpServers || {}).length;
    print.success(`Merged MCP servers (total: ${count})`);
  }
}

// Install status line (Claude Code)
function installStatusline(): void {
  print.info("Installing status line...");

  const claudeDir = join(process.env.HOME || "", ".claude");
  const scriptDest = join(claudeDir, "statusline-command.sh");
  const settingsFile = join(claudeDir, "settings.json");

  mkdirSync(claudeDir, { recursive: true });

  const sourceScript = join(TMP_DIR, "statusline", "statusline-command.sh");
  if (!existsSync(sourceScript)) {
    print.error("Status line script not found");
    return;
  }

  copyFileSync(sourceScript, scriptDest);
  execSync(`chmod +x "${scriptDest}"`);

  // Update settings.json
  let settings: any = {};
  if (existsSync(settingsFile)) {
    settings = JSON.parse(readFileSync(settingsFile, "utf-8"));
  }
  settings.statusLine = { type: "command", command: scriptDest };
  writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + "\n");

  print.success(`Status line installed at ${scriptDest}`);
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
      case "--workflows-path":
        opts.workflowsPath = expandPath(next);
        i++;
        break;
      case "--workflows-prefix":
        opts.workflowsPrefix = next;
        i++;
        break;
      case "--zsh-path":
        opts.zshPath = expandPath(next);
        i++;
        break;
      case "--mcp-path":
        opts.mcpPath = expandPath(next);
        i++;
        break;
      case "--platform":
        opts.platform = next as Platform;
        i++;
        break;
      case "--install-statusline":
        opts.installStatusline = true;
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
  if (
    !opts.rulesPath &&
    !opts.skillsPath &&
    !opts.agentsPath &&
    !opts.workflowsPath &&
    !opts.zshPath &&
    !opts.mcpPath &&
    !opts.installStatusline
  ) {
    print.error("No destination specified. At least one path is required.");
    showUsage();
  }

  // Auto-detect platform
  const platform = opts.platform || detectPlatform(opts);

  // Determine folders to clone
  const folders: string[] = [];

  if (opts.rulesPath) folders.push("guidelines");
  if (opts.skillsPath) {
    folders.push(`integrations/${platform}/skills`);
    if (platform !== "claude-code") folders.push("integrations/claude-code/skills");
  }
  if (opts.agentsPath) {
    folders.push(platform === "opencode" ? "integrations/opencode/agents" : "integrations/claude-code/sub-agents");
  }
  if (opts.workflowsPath) folders.push("integrations/windsurf/workflows");
  if (opts.zshPath) folders.push("shell");
  if (opts.mcpPath) {
    if (platform === "opencode") {
      folders.push("integrations/opencode/mcp.json", "integrations/opencode/opencode.json");
    } else {
      folders.push("integrations/claude-code/mcp.json");
    }
  }
  if (opts.installStatusline) folders.push("statusline");

  // Show summary
  console.log(`
${colors.blue("╔═══════════════════════════════════════════════════════════╗")}
${colors.blue("║   AI Concise Guidelines - Installer                      ║")}
${colors.blue("╚═══════════════════════════════════════════════════════════╝")}

${colors.yellow("═══════════════════════════════════════════════════════════")}
${colors.blue(`Installation Summary (platform: ${platform}):`)}
${opts.rulesPath ? `  • Rules: ${opts.rulesPath}` : ""}
${opts.skillsPath ? `  • Skills: ${opts.skillsPath}` : ""}
${opts.agentsPath ? `  • Agents: ${opts.agentsPath}` : ""}
${opts.workflowsPath ? `  • Workflows: ${opts.workflowsPath}` : ""}
${opts.zshPath ? `  • ZSH Config: ${opts.zshPath}` : ""}
${opts.mcpPath ? `  • MCP: ${opts.mcpPath}` : ""}
${opts.installStatusline ? "  • Status line: ~/.claude/statusline-command.sh" : ""}
${colors.yellow("═══════════════════════════════════════════════════════════")}
`);

  // Execute installation
  cloneRepository(folders);

  if (opts.rulesPath) copyRules(opts.rulesPath, opts.rulesAction);
  if (opts.skillsPath) copySkills(opts.skillsPath, platform);
  if (opts.agentsPath) copyAgents(opts.agentsPath, platform);
  if (opts.workflowsPath) copyWorkflows(opts.workflowsPath, opts.workflowsPrefix);
  if (opts.zshPath) copyZsh(opts.zshPath);
  if (opts.mcpPath) mergeMcp(opts.mcpPath, platform);
  if (opts.installStatusline) installStatusline();

  console.log(`
${colors.green("╔═══════════════════════════════════════════════════════════╗")}
${colors.green("║           ✓ Installation completed successfully!         ║")}
${colors.green("╚═══════════════════════════════════════════════════════════╝")}
`);
}

main();
