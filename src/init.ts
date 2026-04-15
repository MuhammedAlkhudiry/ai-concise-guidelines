#!/usr/bin/env bun

/**
 * Installer Script
 * Installs generated files for OpenCode and Codex
 *
 * Usage: bun src/init.ts [OPTIONS]
 */

import { existsSync, copyFileSync } from "fs";
import { readFile, writeFile, copyFile, chmod, readdir, rm } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import { colors, print, printBox, printSeparator } from "./print";
import { ensureDir, ensureParentDirSync, copyDirAsync, ensureParentDir } from "./fs";

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
  plugins: join(HOME, ".config/opencode/plugin"),
  config: join(HOME, ".config/opencode/opencode.json"),
};

const CODEX_PATHS = {
  rules: join(HOME, ".codex/AGENTS.md"),
  config: join(HOME, ".codex/config.toml"),
};

const SHARED_PATHS = {
  skills: join(HOME, ".agents/skills"),
  zsh: join(HOME, ".config/zsh-sync/custom.zsh"),
  zshenv: join(HOME, ".zshenv"),
  binDir: join(HOME, "bin"),
};

const SHARED_BIN_COMMANDS = [
  { name: "gbr", source: "gbr.zsh" },
  { name: "hugeicons", source: "hugeicons.zsh" },
  { name: "remote", source: "remote.zsh" },
  { name: "remote-tinker", source: "remote-tinker.zsh" },
  { name: "remote-info", source: "remote-info.zsh" },
  { name: "hosts", source: "hosts.zsh" },
  { name: "doctor", source: "doctor.zsh" },
];

// =============================================================================
// Copy Task System
// =============================================================================

interface CopyTask {
  name: string;
  src: string;
  dest: string;
  extensions?: string[];
}

function getSourceDir(): string {
  return LOCAL_MODE ? ROOT_DIR : TMP_DIR;
}

function buildOpencodeTasks(): CopyTask[] {
  const sourceDir = getSourceDir();
  const opencodeDir = join(sourceDir, "output", "opencode");

  return [
    {
      name: "plugins",
      src: join(opencodeDir, "plugin"),
      dest: OPENCODE_PATHS.plugins,
      extensions: [".ts", ".js"],
    },
  ];
}

// =============================================================================
// Individual Operations
// =============================================================================

function cloneRepository(): void {
  if (LOCAL_MODE) {
    print.info("Using local output directory...");
    const opencodeOutputDir = join(ROOT_DIR, "output", "opencode");
    const codexOutputDir = join(ROOT_DIR, "output", "codex");
    if (!existsSync(opencodeOutputDir) || !existsSync(codexOutputDir)) {
      print.error("Local output not found. Run 'bun src/generate.ts' first.");
      process.exit(1);
    }
    print.success("Local output directories found");
    return;
  }

  print.info("Cloning repository...");

  const folders = [
    "content/base-rules.md",
    "content/skills",
    "output/opencode/plugin",
    "output/opencode/opencode-config.json",
    "output/codex/mcp-servers.toml",
    "shell/zsh-custom.zsh",
    "shell/gbr.zsh",
    "shell/hugeicons.zsh",
    "shell/remote.zsh",
    "shell/remote-tinker.zsh",
    "shell/remote-info.zsh",
    "shell/hosts.zsh",
    "shell/doctor.zsh",
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

function cleanup(): void {
  if (!LOCAL_MODE && existsSync(TMP_DIR)) {
    const { rmSync } = require("fs");
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

// =============================================================================
// Async install functions (for parallel execution)
// =============================================================================

async function installSharedSkills(): Promise<void> {
  const sourceDir = getSourceDir();
  const src = join(sourceDir, "content", "skills");
  if (!existsSync(src)) {
    print.error("Skills folder not found");
    return;
  }
  await syncManagedSkillsAsync({
    src,
    dest: SHARED_PATHS.skills,
    label: "shared skills",
  });
}

async function installOpencode(): Promise<void> {
  copyOpencodeRules();
  const tasks = buildOpencodeTasks();
  for (const task of tasks) {
    print.info(`Copying ${task.name} to ${task.dest}...`);
    if (!existsSync(task.src)) {
      print.error(`${task.name} folder not found`);
      continue;
    }
    const count = await copyDirAsync({
      src: task.src,
      dest: task.dest,
      extensions: task.extensions,
    });
    print.success(`Copied ${count} ${task.name}`);
  }
  await mergeOpencodeConfigAsync();
}

async function mergeOpencodeConfigAsync(): Promise<void> {
  print.info(`Merging OpenCode config into ${OPENCODE_PATHS.config}...`);
  const sourceFile = join(getSourceDir(), "output", "opencode", "opencode-config.json");
  if (!existsSync(sourceFile)) {
    print.error("opencode-config.json not found (run 'bun src/generate.ts' first)");
    return;
  }
  const configContent = (await readFile(sourceFile, "utf-8")).replace(/<home>/g, HOME);
  const settings = JSON.parse(configContent) as Record<string, unknown>;
  await ensureParentDir(OPENCODE_PATHS.config);
  let existingConfig: Record<string, unknown> = {};
  if (existsSync(OPENCODE_PATHS.config)) {
    try {
      existingConfig = JSON.parse(await readFile(OPENCODE_PATHS.config, "utf-8"));
    } catch {
      print.warning("Failed to parse existing config, creating new file");
    }
  }
  const merged = {
    ...existingConfig,
    model: settings.model,
    small_model: settings.small_model,
    keybinds: {
      ...((existingConfig.keybinds as Record<string, unknown>) || {}),
      ...((settings.keybinds as Record<string, unknown>) || {}),
    },
    permission: {
      ...((existingConfig.permission as Record<string, unknown>) || {}),
      ...((settings.permission as Record<string, unknown>) || {}),
    },
    agent: {
      ...((existingConfig.agent as Record<string, unknown>) || {}),
      ...((settings.agent as Record<string, unknown>) || {}),
    },
    plugin: settings.plugin,
    mcp: settings.mcp,
  };
  await writeFile(OPENCODE_PATHS.config, JSON.stringify(merged, null, 2) + "\n");
  print.success("OpenCode config merged");
}

async function installCodex(): Promise<void> {
  copyCodexRules();
  await mergeCodexMcpConfigAsync();
}

async function mergeCodexMcpConfigAsync(): Promise<void> {
  print.info(`Merging Codex MCP config into ${CODEX_PATHS.config}...`);
  const sourceFile = join(getSourceDir(), "output", "codex", "mcp-servers.toml");
  if (!existsSync(sourceFile)) {
    print.error("mcp-servers.toml not found (run 'bun src/generate.ts' first)");
    return;
  }
  const managedContent = (await readFile(sourceFile, "utf-8")).trimEnd();
  const startMarker = "# >>> ai-concise-guidelines mcp >>>";
  const endMarker = "# <<< ai-concise-guidelines mcp <<<";
  const managedBlock = `${startMarker}\n${managedContent}\n${endMarker}\n`;
  await ensureParentDir(CODEX_PATHS.config);
  const existing = existsSync(CODEX_PATHS.config) ? await readFile(CODEX_PATHS.config, "utf-8") : "";
  const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const managedPattern = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, "g");
  const orphanMarkerPattern = new RegExp(`^(${escapedStart}|${escapedEnd})\\s*$\\n?`, "gm");
  const previousManagedContent = Array.from(existing.matchAll(managedPattern), (match) => match[0]).join("\n");
  const previousManagedServerNames = getManagedMcpServerNames(previousManagedContent);
  const currentManagedServerNames = getManagedMcpServerNames(managedContent);
  const managedServerNames = new Set([...previousManagedServerNames, ...currentManagedServerNames]);
  const withoutManagedBlock = existing.replace(managedPattern, "").replace(orphanMarkerPattern, "");
  const cleaned = removeManagedMcpServers(withoutManagedBlock, managedServerNames).trimEnd();
  const merged = cleaned.length > 0 ? `${cleaned}\n\n${managedBlock}` : managedBlock;
  await writeFile(CODEX_PATHS.config, merged);
  print.success("Codex MCP config merged");
}

async function installShared(): Promise<void> {
  const zshSource = join(getSourceDir(), "shell", "zsh-custom.zsh");
  if (existsSync(zshSource)) {
    print.info(`Copying zsh config to ${SHARED_PATHS.zsh}...`);
    await ensureParentDir(SHARED_PATHS.zsh);
    await copyFile(zshSource, SHARED_PATHS.zsh);
    print.success("Zsh config copied");
  } else {
    print.error("zsh-custom.zsh not found");
  }

  for (const command of SHARED_BIN_COMMANDS) {
    const sourcePath = join(getSourceDir(), "shell", command.source);
    const destinationPath = join(SHARED_PATHS.binDir, command.name);

    if (!existsSync(sourcePath)) {
      print.error(`${command.source} not found`);
      continue;
    }

    print.info(`Installing ${command.name} command to ${destinationPath}...`);
    await ensureParentDir(destinationPath);
    await copyFile(sourcePath, destinationPath);
    await chmod(destinationPath, 0o755);
    print.success(`${command.name} command installed`);
  }

  print.info(`Ensuring ~/bin is in PATH via ${SHARED_PATHS.zshenv}...`);
  await ensureParentDir(SHARED_PATHS.zshenv);
  const pathLine = 'export PATH="$HOME/bin:$PATH"';
  const zshenvContent = existsSync(SHARED_PATHS.zshenv)
    ? await readFile(SHARED_PATHS.zshenv, "utf-8")
    : "";

  if (!zshenvContent.includes(pathLine)) {
    const nextContent = `${zshenvContent.trimEnd()}\n${pathLine}\n`;
    await writeFile(SHARED_PATHS.zshenv, nextContent);
    print.success("Added ~/bin PATH entry to .zshenv");
  } else {
    print.success("PATH entry already present in .zshenv");
  }

}

function configureRepoGitHooks(): void {
  if (!LOCAL_MODE) {
    return;
  }

  const gitDir = join(ROOT_DIR, ".git");
  const hooksDir = join(ROOT_DIR, ".githooks");

  if (!existsSync(gitDir) || !existsSync(hooksDir)) {
    return;
  }

  print.info(`Configuring repo git hooks from ${hooksDir}...`);

  try {
    execSync(`git config core.hooksPath ${JSON.stringify(hooksDir)}`, {
      cwd: ROOT_DIR,
      stdio: "pipe",
    });
    print.success("Repo git hooks configured");
  } catch {
    print.warning("Failed to configure repo git hooks");
  }
}

interface ManagedSkillSyncOptions {
  src: string;
  dest: string;
  label: string;
}

async function syncManagedSkillsAsync(options: ManagedSkillSyncOptions): Promise<void> {
  const { src, dest, label } = options;
  print.info(`Syncing ${label} to ${dest} (preserving existing custom skills)...`);

  await ensureDir(dest);

  const entries = await readdir(src, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const manifestPath = join(dest, ".ai-concise-guidelines-managed-skills.json");
  let previousSkillNames: string[] = [];

  if (existsSync(manifestPath)) {
    try {
      const manifestContent = JSON.parse(await readFile(manifestPath, "utf-8")) as unknown;
      previousSkillNames = Array.isArray(manifestContent)
        ? manifestContent.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      print.warning(`Failed to parse ${manifestPath}, rebuilding managed skill manifest`);
    }
  }

  const deletedManagedSkills = previousSkillNames.filter((skillName) => !skillNames.includes(skillName));

  for (const skillName of deletedManagedSkills) {
    const installedSkillPath = join(dest, skillName);
    if (!existsSync(installedSkillPath)) {
      continue;
    }
    await rm(installedSkillPath, { recursive: true, force: true });
  }

  for (const skillName of skillNames) {
    await copyDirAsync({
      src: join(src, skillName),
      dest: join(dest, skillName),
    });
  }

  await writeFile(manifestPath, JSON.stringify(skillNames, null, 2) + "\n");
  print.success(`Synced ${skillNames.length} ${label}`);
}

// =============================================================================
// Main
// =============================================================================

function showUsage(): never {
  console.log(`
${colors.blue("+=============================================================+")}
${colors.blue("|   AI Concise Guidelines - Installer                         |")}
${colors.blue("|   Supports: OpenCode + Codex                                |")}
${colors.blue("+=============================================================+")}

Usage: bun src/init.ts [OPTIONS]

Options:
  --help, -h     Show this help message
  --local, -l    Use local output directory instead of cloning from GitHub

Installs to:

  ${colors.blue("OpenCode:")}
    Rules:    ${OPENCODE_PATHS.rules}
    Plugins:  ${OPENCODE_PATHS.plugins}
    Config:   ${OPENCODE_PATHS.config}

  ${colors.blue("Codex:")}
    Rules:    ${CODEX_PATHS.rules}
    Config:   ${CODEX_PATHS.config}

  ${colors.yellow("Shared:")}
    Skills:   ${SHARED_PATHS.skills}
    Zsh:      ${SHARED_PATHS.zsh}
    Zshenv:   ${SHARED_PATHS.zshenv}
    Bin:      ${SHARED_PATHS.binDir} (${SHARED_BIN_COMMANDS.map((command) => command.name).join(", ")})

Notes:
  - Managed skills overwrite matching generated skills and prune removed managed skills.
  - Existing custom skills in user skill folders are preserved.
`);
  process.exit(0);
}

async function main() {
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
  console.log(`    Plugins:  ${OPENCODE_PATHS.plugins} (clean)`);
  console.log(`    Config:   ${OPENCODE_PATHS.config} (merge)`);
  console.log();
  console.log(colors.blue("  Codex:"));
  console.log(`    Rules:    ${CODEX_PATHS.rules}`);
  console.log(`    Config:   ${CODEX_PATHS.config} (managed block merge)`);
  console.log();
  console.log(colors.yellow("  Shared:"));
  console.log(`    Skills:   ${SHARED_PATHS.skills} (managed sync, prune removed, preserve others)`);
  console.log(`    Zsh:      ${SHARED_PATHS.zsh}`);
  console.log(`    Zshenv:   ${SHARED_PATHS.zshenv}`);
  console.log(`    Bin:      ${SHARED_PATHS.binDir} (${SHARED_BIN_COMMANDS.map((command) => command.name).join(", ")})`);
  printSeparator();
  console.log();

  // Execute installation
  cloneRepository();
  configureRepoGitHooks();

  // Parallel installation: shared skills + OpenCode + Codex + Shared
  console.log();
  console.log(colors.blue("Installing in parallel..."));
  await Promise.all([
    installSharedSkills(),
    installOpencode(),
    installCodex(),
    installShared(),
  ]);

  console.log();
  printBox("Installation completed successfully!", "green");
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
