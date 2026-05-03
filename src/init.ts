#!/usr/bin/env bun

/**
 * Internal local installer used by `make install`.
 */

import { existsSync, copyFileSync } from "fs";
import { readFile, writeFile, copyFile, chmod, readdir, rm, mkdtemp } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";
import { colors, print, printBox, printSeparator } from "./print";
import { ensureDir, ensureParentDirSync, copyDirAsync, ensureParentDir } from "./fs";
import { REMOTE_SKILL_SOURCES, type RemoteSkill, type RemoteSkillSource } from "../config/skills";

// =============================================================================
// Constants
// =============================================================================

const HOME = process.env.HOME || "";
const ROOT_DIR = join(import.meta.dir, "..");

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
  zshrc: join(HOME, ".zshrc"),
  zshenv: join(HOME, ".zshenv"),
  binDir: join(HOME, "bin"),
};

const USER_ZSHRC_HEADER = "# Managed shell config lives in ai-concise-guidelines.";
const USER_ZSHRC_IMPORT = '[ -f "$HOME/.config/zsh-sync/custom.zsh" ] && source "$HOME/.config/zsh-sync/custom.zsh"';

const SHARED_BIN_COMMANDS = [
  { name: "ai-assistant", source: "ai-assistant.zsh" },
  { name: "gbr", source: "gbr.zsh" },
  { name: "hugeicons", source: "hugeicons.zsh" },
  { name: "remote", source: "remote.zsh" },
  { name: "remote-tinker", source: "remote-tinker.zsh" },
  { name: "remote-info", source: "remote-info.zsh" },
  { name: "hosts", source: "hosts.zsh" },
  { name: "doctor", source: "doctor.zsh" },
];

// =============================================================================
// Individual Operations
// =============================================================================

function copyOpencodeRules(): void {
  print.info(`Copying OpenCode rules to ${OPENCODE_PATHS.rules}...`);

  const sourceFile = join(ROOT_DIR, "content", "base-rules.md");
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

  const sourceFile = join(ROOT_DIR, "content", "base-rules.md");
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

async function assertThinUserZshrc(): Promise<void> {
  print.info(`Checking ${SHARED_PATHS.zshrc} stays thin...`);

  if (!existsSync(SHARED_PATHS.zshrc)) {
    print.error(`${SHARED_PATHS.zshrc} is missing.`);
    print.error(`Create it with only:\n${USER_ZSHRC_HEADER}\n${USER_ZSHRC_IMPORT}`);
    process.exit(1);
  }

  const content = await readFile(SHARED_PATHS.zshrc, "utf-8");
  const codeLines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (codeLines.length === 1 && codeLines[0] === USER_ZSHRC_IMPORT) {
    print.success("User .zshrc is thin");
    return;
  }

  print.error(`${SHARED_PATHS.zshrc} must only import ${SHARED_PATHS.zsh}.`);
  print.error("Move custom shell code into shell/zsh-custom.zsh, then run make install again.");
  print.error(`Expected ${SHARED_PATHS.zshrc}:\n${USER_ZSHRC_HEADER}\n${USER_ZSHRC_IMPORT}`);
  process.exit(1);
}

// =============================================================================
// Async install functions (for parallel execution)
// =============================================================================

async function installSharedSkills(): Promise<void> {
  const src = join(ROOT_DIR, "content", "skills");
  if (!existsSync(src)) {
    print.error("Skills folder not found");
    return;
  }
  await syncManagedSkillsAsync({
    src,
    dest: SHARED_PATHS.skills,
    label: "shared skills",
    remoteSkillSources: REMOTE_SKILL_SOURCES,
  });
}

async function installOpencode(): Promise<void> {
  copyOpencodeRules();
  const pluginsSource = join(ROOT_DIR, "output", "opencode", "plugin");
  print.info(`Copying plugins to ${OPENCODE_PATHS.plugins}...`);
  if (!existsSync(pluginsSource)) {
    print.error("plugins folder not found");
  } else {
    const count = await copyDirAsync({
      src: pluginsSource,
      dest: OPENCODE_PATHS.plugins,
      extensions: [".ts", ".js"],
    });
    print.success(`Copied ${count} plugins`);
  }
  await mergeOpencodeConfigAsync();
}

async function mergeOpencodeConfigAsync(): Promise<void> {
  print.info(`Merging OpenCode config into ${OPENCODE_PATHS.config}...`);
  const sourceFile = join(ROOT_DIR, "output", "opencode", "opencode-config.json");
  if (!existsSync(sourceFile)) {
    print.error("opencode-config.json not found. Run make install.");
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
  const sourceFile = join(ROOT_DIR, "output", "codex", "mcp-servers.toml");
  if (!existsSync(sourceFile)) {
    print.error("mcp-servers.toml not found. Run make install.");
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
  const zshSource = join(ROOT_DIR, "shell", "zsh-custom.zsh");
  if (existsSync(zshSource)) {
    print.info(`Copying zsh config to ${SHARED_PATHS.zsh}...`);
    await ensureParentDir(SHARED_PATHS.zsh);
    await copyFile(zshSource, SHARED_PATHS.zsh);
    print.success("Zsh config copied");
  } else {
    print.error("zsh-custom.zsh not found");
  }

  for (const command of SHARED_BIN_COMMANDS) {
    const sourcePath = join(ROOT_DIR, "shell", command.source);
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

function installAiAssistantLaunchAgent(): void {
  const commandPath = join(SHARED_PATHS.binDir, "ai-assistant");
  if (!existsSync(commandPath)) {
    print.error("ai-assistant command not found after install");
    process.exit(1);
  }

  print.info("Ensuring ai-assistant LaunchAgent is installed...");

  try {
    execSync(`${JSON.stringify(commandPath)} install`, {
      stdio: "inherit",
      env: process.env,
    });
    print.success("ai-assistant LaunchAgent ready");
  } catch {
    print.error("Failed to install ai-assistant LaunchAgent");
    process.exit(1);
  }
}

function configureRepoGitHooks(): void {
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
  remoteSkillSources?: RemoteSkillSource[];
}

async function syncManagedSkillsAsync(options: ManagedSkillSyncOptions): Promise<void> {
  const { src, dest, label, remoteSkillSources = [] } = options;
  print.info(`Syncing ${label} to ${dest} (preserving existing custom skills)...`);

  await ensureDir(dest);

  const entries = await readdir(src, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const remoteSkillNames = remoteSkillSources
    .flatMap((source) => source.skills.map((skill) => skill.name))
    .sort();
  const managedSkillNames = [...new Set([...skillNames, ...remoteSkillNames])].sort();
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

  const deletedManagedSkills = previousSkillNames.filter((skillName) => !managedSkillNames.includes(skillName));

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

  await Promise.all(remoteSkillSources.map((source) => installRemoteSkillSource(source, dest)));

  await writeFile(manifestPath, JSON.stringify(managedSkillNames, null, 2) + "\n");
  print.success(`Synced ${managedSkillNames.length} ${label}`);
}

async function installRemoteSkillSource(source: RemoteSkillSource, dest: string): Promise<void> {
  const skillNames = source.skills.map((skill) => skill.name).join(", ");
  print.info(`Fetching remote skill source ${skillNames} from ${source.repository}...`);

  const tempDir = await mkdtemp(join(tmpdir(), "ai-concise-skills-"));
  const repoDir = join(tempDir, "repo");
  const sparsePaths = source.skills.map((skill) => JSON.stringify(skill.sourcePath)).join(" ");

  try {
    execSync(
      [
        "git clone --depth=1 --filter=blob:none --sparse",
        `--branch ${JSON.stringify(source.ref)}`,
        JSON.stringify(source.repository),
        JSON.stringify(repoDir),
      ].join(" "),
      { stdio: "pipe" }
    );
    execSync(`git sparse-checkout set --no-cone ${sparsePaths}`, {
      cwd: repoDir,
      stdio: "pipe",
    });

    for (const skill of source.skills) {
      await installRemoteSkill(skill, repoDir, dest);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function installRemoteSkill(skill: RemoteSkill, repoDir: string, dest: string): Promise<void> {
  const skillSrc = join(repoDir, skill.sourcePath);
  if (!existsSync(join(skillSrc, "SKILL.md"))) {
    throw new Error(`Remote skill ${skill.name} is missing SKILL.md at ${skill.sourcePath}`);
  }

  await copyDirAsync({
    src: skillSrc,
    dest: join(dest, skill.name),
  });
  await normalizeRemoteSkillName(join(dest, skill.name, "SKILL.md"), skill.name);
}

async function normalizeRemoteSkillName(skillPath: string, skillName: string): Promise<void> {
  const content = await readFile(skillPath, "utf-8");
  await writeFile(skillPath, content.replace(/^name:\s*.+$/m, `name: ${skillName}`));
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log();
  printBox("AI Concise Guidelines - Installer");
  console.log();
  printSeparator();
  console.log(colors.blue("Installing from local repo"));
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

  await assertThinUserZshrc();
  configureRepoGitHooks();

  console.log();
  console.log(colors.blue("Installing in parallel..."));
  await Promise.all([
    installSharedSkills(),
    installOpencode(),
    installCodex(),
    installShared(),
  ]);

  installAiAssistantLaunchAgent();

  console.log();
  printBox("Installation completed successfully!", "green");
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
