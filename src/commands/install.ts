#!/usr/bin/env bun

/**
 * Internal local installer used by `mise run install`.
 */

import { existsSync, copyFileSync } from "fs";
import {
  readFile,
  writeFile,
  copyFile,
  chmod,
  rm,
  mkdtemp,
  symlink,
  readdir,
  rename,
} from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { execa } from "execa";
import {
  OPTIONAL_EXTERNAL_SKILL_NAMES,
  REMOTE_SKILL_SOURCES,
  type RemoteSkill,
  type RemoteSkillSource,
} from "../../config/skills";
import { CODEX_CONFIG } from "../../config/codex";
import { ACTIVE_PROJECTS } from "../../config/active-projects";
import { CREDENTIALS_HOME_ENV, CREDENTIALS_ROOT } from "../../config/credentials";
import { createOpencodeConfig } from "../../config/opencode";
import { ensureDir, ensureParentDirSync, copyDirAsync, ensureParentDir } from "../lib/fs";
import { createLanesConfig } from "../lib/lanes-config";
import { migrateManagedCredentials } from "../lib/credentials";
import { colors, compactOutput, print, printBox, printSeparator } from "../lib/print";
import { getRemoteSkillRefreshDecision, recordRemoteSkillRefresh } from "../lib/remote-skills";
import { discoverLocalSkills } from "../lib/skills";
import { validateRemoteSkillSources } from "../lib/validation";
import { installLanesMenu } from "../apps/lanes-menu/install";

// =============================================================================
// Constants
// =============================================================================

const HOME = process.env.HOME || "";
const ROOT_DIR = join(import.meta.dir, "..", "..");
const CONFIG_HOME = process.env.XDG_CONFIG_HOME || join(HOME, ".config");
const STATE_HOME = process.env.XDG_STATE_HOME || join(HOME, ".local/state");

// =============================================================================
// Destination Paths
// =============================================================================

const OPENCODE_PATHS = {
  rules: join(HOME, ".config/opencode/AGENTS.md"),
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
  credentials: join(HOME, CREDENTIALS_ROOT),
  secrets: join(HOME, CREDENTIALS_ROOT, "secrets.zsh"),
  binDir: join(HOME, "bin"),
  localBinDir: join(HOME, ".local/bin"),
  lanesConfig: join(CONFIG_HOME, "lanes/projects.json"),
  lanesState: join(STATE_HOME, "lanes/state.json"),
};

const REMOTE_SKILLS_STATE_PATH = join(STATE_HOME, "my-setup/remote-skills.json");

const USER_ZSHRC_HEADER = "# Managed shell config lives in my-setup.";
const USER_ZSHRC_IMPORT =
  '[ -f "$HOME/.config/zsh-sync/custom.zsh" ] && source "$HOME/.config/zsh-sync/custom.zsh"';
const REQUIRED_SECRETS = ["POSTHOG_CLI_API_KEY", "HUGEICONS_TOKEN"] as const;
const SOLO_CLI_SOURCE = "/Applications/Solo.app/Contents/MacOS/solo-cli";

const SHARED_BIN_COMMANDS = [
  { name: "my-setup", source: "my-setup.zsh" },
  { name: "context-health", source: "context-health.zsh" },
  { name: "hugeicons", source: "hugeicons.zsh" },
  { name: "hosts", source: "hosts.zsh" },
  { name: "doctor", source: "doctor.zsh" },
  { name: "plan", source: "plan.zsh" },
  { name: "knowledge", source: "knowledge.zsh" },
  { name: "lanes", source: "lanes.zsh" },
  { name: "sentry-cli", source: "sentry-cli.zsh" },
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

function removeCodexMcpConfig(configToml: string): string {
  const withoutManagedBlock = configToml.replace(
    /^# >>> my-setup mcp >>>$[\s\S]*?^# <<< my-setup mcp <<<$\n?/gm,
    "",
  );
  const lines = withoutManagedBlock.split(/\r?\n/);
  const cleanedLines: string[] = [];
  let removingMcpSection = false;

  for (const line of lines) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      removingMcpSection =
        sectionMatch[1] === "mcp_servers" || sectionMatch[1].startsWith("mcp_servers.");

      if (removingMcpSection) {
        while (cleanedLines.at(-1)?.trim() === "") {
          cleanedLines.pop();
        }
        continue;
      }
    }

    if (!removingMcpSection) {
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join("\n").trimEnd();
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
  print.error("Move custom shell code into shell/zsh-custom.zsh, then run mise run install again.");
  print.error(`Expected ${SHARED_PATHS.zshrc}:\n${USER_ZSHRC_HEADER}\n${USER_ZSHRC_IMPORT}`);
  process.exit(1);
}

// =============================================================================
// Async install functions (for parallel execution)
// =============================================================================

async function installSharedSkills(): Promise<void> {
  const remoteSkillSources = validateRemoteSkillSources(REMOTE_SKILL_SOURCES);
  const src = join(ROOT_DIR, "content", "skills");
  if (!existsSync(src)) {
    print.error("Skills folder not found");
    return;
  }
  await syncManagedSkillsAsync({
    src,
    dest: SHARED_PATHS.skills,
    label: "shared skills",
    remoteSkillSources,
  });
}

async function installOpencode(): Promise<void> {
  copyOpencodeRules();
  await mergeOpencodeConfigAsync();
}

async function mergeOpencodeConfigAsync(): Promise<void> {
  print.info(`Merging OpenCode config into ${OPENCODE_PATHS.config}...`);
  const settings = createOpencodeConfig(HOME);
  await ensureParentDir(OPENCODE_PATHS.config);
  let existingConfig: Record<string, unknown> = {};
  if (existsSync(OPENCODE_PATHS.config)) {
    try {
      existingConfig = JSON.parse(await readFile(OPENCODE_PATHS.config, "utf-8"));
    } catch {
      print.warning("Failed to parse existing config, creating new file");
    }
  }
  delete existingConfig.mcp;
  const merged = {
    ...existingConfig,
    model: settings.model,
    small_model: settings.small_model,
    keybinds: {
      ...(existingConfig.keybinds as Record<string, unknown>),
      ...(settings.keybinds as Record<string, unknown>),
    },
    permission: {
      ...(existingConfig.permission as Record<string, unknown>),
      ...(settings.permission as Record<string, unknown>),
    },
    agent: {
      ...(existingConfig.agent as Record<string, unknown>),
      ...(settings.agent as Record<string, unknown>),
    },
    plugin: settings.plugin,
  };
  await writeFile(OPENCODE_PATHS.config, JSON.stringify(merged, null, 2) + "\n");
  print.success("OpenCode config merged");
}

async function installCodex(): Promise<void> {
  copyCodexRules();
  await mergeCodexConfigAsync();
  await removeCodexMcpConfigAsync();
}

function upsertTomlTopLevelKey(configToml: string, key: string, value: string): string {
  const trimmed = configToml.trimEnd();
  const lines = trimmed ? trimmed.split(/\r?\n/) : [];
  const nextLine = `${key} = ${value}`;
  const firstSectionIndex = lines.findIndex((line) => /^\s*\[/.test(line));
  const topLevelEnd = firstSectionIndex === -1 ? lines.length : firstSectionIndex;

  for (let i = 0; i < topLevelEnd; i++) {
    if (new RegExp(`^\\s*${key}\\s*=`).test(lines[i])) {
      lines[i] = nextLine;
      return `${lines.join("\n")}\n`;
    }
  }

  lines.splice(topLevelEnd, 0, nextLine);
  return `${lines.join("\n")}\n`;
}

function upsertTomlSectionKey(
  configToml: string,
  sectionName: string,
  key: string,
  value: string,
): string {
  const lines = configToml.trimEnd().split(/\r?\n/);
  const sectionHeader = `[${sectionName}]`;
  const sectionIndex = lines.findIndex((line) => line.trim() === sectionHeader);
  const nextLine = `${key} = ${value}`;

  if (sectionIndex === -1) {
    const trimmed = configToml.trimEnd();
    return trimmed
      ? `${trimmed}\n\n${sectionHeader}\n${nextLine}\n`
      : `${sectionHeader}\n${nextLine}\n`;
  }

  let insertIndex = lines.length;
  for (let i = sectionIndex + 1; i < lines.length; i++) {
    if (/^\s*\[/.test(lines[i])) {
      insertIndex = i;
      break;
    }

    if (new RegExp(`^\\s*${key}\\s*=`).test(lines[i])) {
      lines[i] = nextLine;
      return `${lines.join("\n")}\n`;
    }
  }

  lines.splice(insertIndex, 0, nextLine);
  return `${lines.join("\n")}\n`;
}

async function mergeCodexConfigAsync(): Promise<void> {
  print.info(`Merging Codex config into ${CODEX_PATHS.config}...`);
  await ensureParentDir(CODEX_PATHS.config);
  const existing = existsSync(CODEX_PATHS.config)
    ? await readFile(CODEX_PATHS.config, "utf-8")
    : "";
  const withModelVerbosity = upsertTomlTopLevelKey(
    existing,
    "model_verbosity",
    JSON.stringify(CODEX_CONFIG.model_verbosity),
  );
  const withAgents = upsertTomlSectionKey(
    withModelVerbosity,
    "agents",
    "max_threads",
    String(CODEX_CONFIG.agents.max_threads),
  );
  const merged = upsertTomlSectionKey(
    withAgents,
    "features",
    "default_mode_request_user_input",
    String(CODEX_CONFIG.features.default_mode_request_user_input),
  );
  await writeFile(CODEX_PATHS.config, merged);
  print.success("Codex config merged");
}

async function removeCodexMcpConfigAsync(): Promise<void> {
  print.info(`Removing MCP config from ${CODEX_PATHS.config}...`);
  await ensureParentDir(CODEX_PATHS.config);
  const existing = existsSync(CODEX_PATHS.config)
    ? await readFile(CODEX_PATHS.config, "utf-8")
    : "";
  const cleaned = removeCodexMcpConfig(existing);
  await writeFile(CODEX_PATHS.config, cleaned ? `${cleaned}\n` : "");
  print.success("Codex MCP config removed");
}

async function installShared(): Promise<void> {
  await installLocalSecrets();
  await installSoloCli();
  await installLanesConfig();

  const zshSource = join(ROOT_DIR, "shell", "zsh-custom.zsh");
  if (existsSync(zshSource)) {
    await installManagedSymlink(zshSource, SHARED_PATHS.zsh, "zsh config");
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

    await installManagedSymlink(sourcePath, destinationPath, `${command.name} command`);
    await chmod(sourcePath, 0o755);
  }

  await installLanesMenu();

  print.info(`Ensuring local command paths are in PATH via ${SHARED_PATHS.zshenv}...`);
  await ensureParentDir(SHARED_PATHS.zshenv);
  const pathLines = ['export PATH="$HOME/bin:$PATH"', 'export PATH="$HOME/.local/bin:$PATH"'];
  const credentialsHomeLine = `export ${CREDENTIALS_HOME_ENV}="$HOME/${CREDENTIALS_ROOT}"`;
  const secretsSourceLine = `[[ -f "$${CREDENTIALS_HOME_ENV}/secrets.zsh" ]] && source "$${CREDENTIALS_HOME_ENV}/secrets.zsh"`;
  const zshenvContent = existsSync(SHARED_PATHS.zshenv)
    ? await readFile(SHARED_PATHS.zshenv, "utf-8")
    : "";
  let nextContent = zshenvContent.trimEnd();
  let changed = false;

  const credentialsHomePattern = new RegExp(`^export ${CREDENTIALS_HOME_ENV}=.*$`, "m");
  if (credentialsHomePattern.test(nextContent)) {
    const updatedContent = nextContent.replace(credentialsHomePattern, credentialsHomeLine);
    changed ||= updatedContent !== nextContent;
    nextContent = updatedContent;
  } else {
    nextContent = `${nextContent}\n${credentialsHomeLine}`;
    changed = true;
  }

  if (!zshenvContent.includes(secretsSourceLine)) {
    nextContent = `${nextContent}\n${secretsSourceLine}`;
    changed = true;
  }

  for (const pathLine of pathLines) {
    if (zshenvContent.includes(pathLine)) {
      continue;
    }

    nextContent = `${nextContent}\n${pathLine}`;
    changed = true;
  }

  if (changed) {
    await writeFile(SHARED_PATHS.zshenv, `${nextContent}\n`);
    print.success("Updated managed shell environment entries in .zshenv");
  } else {
    print.success("Managed shell environment entries already present in .zshenv");
  }
}

async function installLanesConfig(): Promise<void> {
  const legacyStatePath = join(STATE_HOME, "my-setup/active-project-lanes.json");
  if (existsSync(legacyStatePath) && !existsSync(SHARED_PATHS.lanesState)) {
    await ensureParentDir(SHARED_PATHS.lanesState);
    await rename(legacyStatePath, SHARED_PATHS.lanesState);
    print.success(`Migrated lanes state to ${SHARED_PATHS.lanesState}`);
  }

  await ensureParentDir(SHARED_PATHS.lanesConfig);
  await writeFile(
    SHARED_PATHS.lanesConfig,
    `${JSON.stringify(createLanesConfig(ACTIVE_PROJECTS), null, 2)}\n`,
    { mode: 0o600 },
  );
  print.success(`Installed lanes config to ${SHARED_PATHS.lanesConfig}`);
}

async function installSoloCli(): Promise<void> {
  const destinationPath = join(SHARED_PATHS.localBinDir, "solo");

  if (!existsSync(SOLO_CLI_SOURCE)) {
    print.warning(`Solo CLI source not found at ${SOLO_CLI_SOURCE}`);
    return;
  }

  await installManagedSymlink(SOLO_CLI_SOURCE, destinationPath, "solo command");
}

async function installManagedSymlink(src: string, dest: string, label: string): Promise<void> {
  print.info(`Linking ${label} to ${dest}...`);
  await ensureParentDir(dest);
  await rm(dest, { recursive: true, force: true });
  await symlink(src, dest);
  print.success(`${label} linked`);
}

async function installLocalSecrets(): Promise<void> {
  const sourceFile = join(ROOT_DIR, "config", "secrets.default.zsh");

  if (!existsSync(sourceFile)) {
    print.error("secrets.default.zsh not found");
    process.exit(1);
  }

  const migration = await migrateManagedCredentials({ home: HOME });
  for (const path of migration.moved) {
    print.success(`Migrated credential file to ${path}`);
  }
  for (const path of migration.updated) {
    print.success(`Updated credential paths in ${path}`);
  }

  if (!existsSync(SHARED_PATHS.secrets)) {
    print.info(`Creating local secrets file at ${SHARED_PATHS.secrets}...`);
    await copyFile(sourceFile, SHARED_PATHS.secrets);
    print.success("Local secrets file created");
  } else {
    print.success("Local secrets file already present");
  }

  await chmod(SHARED_PATHS.secrets, 0o600);
  await assertRequiredSecrets();
}

async function assertRequiredSecrets(): Promise<void> {
  try {
    const result = await execa(
      "zsh",
      [
        "-c",
        [
          'source "$MY_SETUP_SECRETS"',
          "missing=()",
          'for key in "$@"; do',
          '  [[ -n "${(P)key}" ]] || missing+=("$key")',
          "done",
          "printf '%s\\n' \"${missing[@]}\"",
        ].join("\n"),
        "my-setup-secrets",
        ...REQUIRED_SECRETS,
      ],
      {
        env: {
          [CREDENTIALS_HOME_ENV]: SHARED_PATHS.credentials,
          MY_SETUP_SECRETS: SHARED_PATHS.secrets,
        },
      },
    );

    const missingSecrets = result.stdout.split(/\r?\n/).filter(Boolean);

    if (missingSecrets.length === 0) {
      print.success("Required local secrets are present");
      return;
    }

    for (const secret of missingSecrets) {
      print.error(`Missing required secret: ${secret}`);
    }
    print.error(`Edit ${SHARED_PATHS.secrets}, then run mise run install again.`);
    process.exit(1);
  } catch (error) {
    if (error instanceof Error) {
      print.error(`Failed to validate local secrets: ${error.message}`);
    } else {
      print.error("Failed to validate local secrets");
    }
    process.exit(1);
  }
}

async function configureRepoGitHooks(): Promise<void> {
  const gitDir = join(ROOT_DIR, ".git");
  const hooksDir = join(ROOT_DIR, ".githooks");

  if (!existsSync(gitDir) || !existsSync(hooksDir)) {
    return;
  }

  print.info(`Configuring repo git hooks from ${hooksDir}...`);

  try {
    await execa("git", ["config", "core.hooksPath", hooksDir], {
      cwd: ROOT_DIR,
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

async function pruneInvalidInstalledSkillDirs(dest: string): Promise<number> {
  const entries = await readdir(dest, { withFileTypes: true });
  let removedCount = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const installedSkillPath = join(dest, entry.name);
    if (existsSync(join(installedSkillPath, "SKILL.md"))) {
      continue;
    }

    await rm(installedSkillPath, { recursive: true, force: true });
    removedCount++;
  }

  return removedCount;
}

async function pruneEmptyDirs(dir: string): Promise<number> {
  const entries = await readdir(dir, { withFileTypes: true });
  let removedCount = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const childDir = join(dir, entry.name);
    removedCount += await pruneEmptyDirs(childDir);

    const remainingEntries = await readdir(childDir);
    if (remainingEntries.length > 0) {
      continue;
    }

    await rm(childDir, { recursive: true, force: true });
    removedCount++;
  }

  return removedCount;
}

export async function syncManagedSkillsAsync(options: ManagedSkillSyncOptions): Promise<void> {
  const { src, dest, label, remoteSkillSources = [] } = options;
  print.info(`Syncing ${label} to ${dest} (preserving valid custom skills)...`);

  const sourceEmptyDirCount = await pruneEmptyDirs(src);
  if (sourceEmptyDirCount > 0) {
    print.warning(
      `Removed ${sourceEmptyDirCount} empty source skill director${sourceEmptyDirCount === 1 ? "y" : "ies"}`,
    );
  }

  await ensureDir(dest);
  const invalidSkillCount = await pruneInvalidInstalledSkillDirs(dest);
  if (invalidSkillCount > 0) {
    print.warning(
      `Removed ${invalidSkillCount} installed skill director${invalidSkillCount === 1 ? "y" : "ies"} without SKILL.md`,
    );
  }

  const remoteSkillNames = remoteSkillSources
    .flatMap((source) => source.skills.map((skill) => skill.name))
    .sort();
  const skills = discoverLocalSkills(src, {
    reportWarning: console.warn,
    additionalSkillNames: [...remoteSkillNames, ...OPTIONAL_EXTERNAL_SKILL_NAMES],
  });
  const skillNames = skills.map((skill) => skill.name).sort();
  const managedSkillNames = [...new Set([...skillNames, ...remoteSkillNames])].sort();
  const manifestPath = join(dest, ".my-setup-managed-skills.json");
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

  const deletedManagedSkills = previousSkillNames.filter(
    (skillName) => !managedSkillNames.includes(skillName),
  );

  for (const skillName of deletedManagedSkills) {
    const installedSkillPath = join(dest, skillName);
    if (!existsSync(installedSkillPath)) {
      continue;
    }
    await rm(installedSkillPath, { recursive: true, force: true });
  }

  for (const skill of skills) {
    await copyDirAsync({
      src: skill.dir,
      dest: join(dest, skill.name),
    });
  }

  if (remoteSkillSources.length > 0) {
    const refreshDecision = await getRemoteSkillRefreshDecision({
      sources: remoteSkillSources,
      skillsDir: dest,
      statePath: REMOTE_SKILLS_STATE_PATH,
      force: process.env.MY_SETUP_REFRESH_REMOTE_SKILLS === "1",
    });

    if (refreshDecision.refresh) {
      print.info(`Refreshing remote skills (${refreshDecision.reason})...`);
      await Promise.all(remoteSkillSources.map((source) => installRemoteSkillSource(source, dest)));
      await recordRemoteSkillRefresh(remoteSkillSources, REMOTE_SKILLS_STATE_PATH);
    } else {
      print.info("Skipping remote skill refresh (refreshed within the last 24 hours)");
    }
  }

  const emptyDirCount = await pruneEmptyDirs(dest);
  if (emptyDirCount > 0) {
    print.warning(
      `Removed ${emptyDirCount} empty installed skill director${emptyDirCount === 1 ? "y" : "ies"}`,
    );
  }

  await writeFile(manifestPath, JSON.stringify(managedSkillNames, null, 2) + "\n");
  print.success(`Synced ${managedSkillNames.length} ${label}`);
}

async function installRemoteSkillSource(source: RemoteSkillSource, dest: string): Promise<void> {
  const skillNames = source.skills.map((skill) => skill.name).join(", ");
  print.info(`Fetching remote skill source ${skillNames} from ${source.repository}...`);

  const tempDir = await mkdtemp(join(tmpdir(), "my-setup-skills-"));
  const repoDir = join(tempDir, "repo");

  try {
    await execa(
      "git",
      [
        "clone",
        "--depth=1",
        "--filter=blob:none",
        "--sparse",
        "--branch",
        source.ref,
        source.repository,
        repoDir,
      ],
      { stdio: "pipe" },
    );
    await execa(
      "git",
      ["sparse-checkout", "set", "--no-cone", ...source.skills.map((skill) => skill.sourcePath)],
      {
        cwd: repoDir,
        stdio: "pipe",
      },
    );

    for (const skill of source.skills) {
      await installRemoteSkill(skill, repoDir, dest);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function installRemoteSkill(
  skill: RemoteSkill,
  repoDir: string,
  dest: string,
): Promise<void> {
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

export async function install(): Promise<void> {
  if (!compactOutput) {
    console.log();
    printBox("My Setup - Installer");
    console.log();
    printSeparator();
    console.log(colors.blue("Installing from local repo"));
    console.log();
    console.log(colors.blue("  OpenCode:"));
    console.log(`    Rules:    ${OPENCODE_PATHS.rules}`);
    console.log(`    Config:   ${OPENCODE_PATHS.config} (merge)`);
    console.log();
    console.log(colors.blue("  Codex:"));
    console.log(`    Rules:    ${CODEX_PATHS.rules}`);
    console.log(`    Config:   ${CODEX_PATHS.config} (managed merge)`);
    console.log();
    console.log(colors.yellow("  Shared:"));
    console.log(
      `    Skills:   ${SHARED_PATHS.skills} (managed sync, prune invalid, preserve valid custom)`,
    );
    console.log(`    Zsh:      ${SHARED_PATHS.zsh}`);
    console.log(`    Zshenv:   ${SHARED_PATHS.zshenv}`);
    console.log(`    Secrets:  ${SHARED_PATHS.secrets}`);
    console.log(
      `    Bin:      ${SHARED_PATHS.binDir} (${SHARED_BIN_COMMANDS.map((command) => command.name).join(", ")})`,
    );
    printSeparator();
    console.log();
  }

  await assertThinUserZshrc();
  await configureRepoGitHooks();

  if (!compactOutput) {
    console.log();
    console.log(colors.blue("Installing in parallel..."));
  }
  await Promise.all([installSharedSkills(), installOpencode(), installCodex(), installShared()]);

  if (!compactOutput) {
    console.log();
    printBox("Installation completed successfully!", "green");
    console.log();
  }
}

if (import.meta.main) {
  install().catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });
}
