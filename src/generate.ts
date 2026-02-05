#!/usr/bin/env bun

/**
 * Generator Script
 * Generates files for both OpenCode and Claude Code from content
 *
 * Usage: bun src/generate.ts
 */

import { readFile, writeFile, rm, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { MODELS } from "../config/models";
import { ensureDir, copyDirAsync } from "./fs";

// =============================================================================
// Paths
// =============================================================================

const ROOT_DIR = join(import.meta.dir, "..");
const CONTENT_DIR = join(ROOT_DIR, "content");
const SKILLS_DIR = join(CONTENT_DIR, "skills");
const PLUGINS_DIR = join(ROOT_DIR, "plugins");
const OUTPUT_DIR = join(ROOT_DIR, "output");

// Tool-specific output directories
const OPENCODE_DIR = join(OUTPUT_DIR, "opencode");
const CLAUDE_DIR = join(OUTPUT_DIR, "claude");

// Config files
const CUSTOM_CONFIG = join(ROOT_DIR, "custom-opencode.json");

// =============================================================================
// Skills Generator
// =============================================================================

async function getSkillNames(): Promise<string[]> {
  if (!existsSync(SKILLS_DIR)) {
    return [];
  }

  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .filter((e) => existsSync(join(SKILLS_DIR, e.name, "SKILL.md")))
    .map((e) => e.name)
    .sort();
}

async function copySkills(destDir: string): Promise<number> {
  const skillNames = await getSkillNames();
  let count = 0;

  for (const name of skillNames) {
    const srcSkillDir = join(SKILLS_DIR, name);
    const destSkillDir = join(destDir, name);

    await copyDirAsync({
      src: srcSkillDir,
      dest: destSkillDir,
      mode: "clean",
    });
    count++;
  }

  return count;
}

// =============================================================================
// OpenCode Generators
// =============================================================================

async function generateOpencodeSkills(): Promise<number> {
  console.log("  [OpenCode] Generating skills...");

  const skillsDir = join(OPENCODE_DIR, "skills");
  await ensureDir(skillsDir);

  const count = await copySkills(skillsDir);
  console.log(`    Copied ${count} skills`);
  return count;
}

async function copyOpencodePlugins(): Promise<number> {
  console.log("  [OpenCode] Copying plugins...");

  if (!existsSync(PLUGINS_DIR)) {
    console.log("    No plugins directory found, skipping");
    return 0;
  }

  const count = await copyDirAsync({
    src: PLUGINS_DIR,
    dest: join(OPENCODE_DIR, "plugin"),
    mode: "clean",
    extensions: [".ts", ".js"],
  });

  console.log(`    Copied ${count} plugins`);
  return count;
}

async function generateOpencodeConfig(): Promise<void> {
  console.log("  [OpenCode] Generating config...");

  if (!existsSync(CUSTOM_CONFIG)) {
    console.log("    No custom-opencode.json found, skipping");
    return;
  }

  const content = await readFile(CUSTOM_CONFIG, "utf-8");

  // Replace model placeholders with actual model names
  const processed = content
    .replace(/<smart-model>/g, MODELS.smart)
    .replace(/<fast-model>/g, MODELS.fast);

  await writeFile(join(OPENCODE_DIR, "opencode-config.json"), processed);
  console.log("    Generated opencode-config.json");
}

// =============================================================================
// Claude Code Generators
// =============================================================================

async function generateClaudeSkills(): Promise<number> {
  console.log("  [Claude Code] Generating skills...");

  const skillsDir = join(CLAUDE_DIR, "skills");
  await ensureDir(skillsDir);

  const count = await copySkills(skillsDir);
  console.log(`    Copied ${count} skills`);
  return count;
}

async function generateClaudeSettings(): Promise<void> {
  console.log("  [Claude Code] Generating settings...");

  if (!existsSync(CUSTOM_CONFIG)) {
    console.log("    No custom-opencode.json found, skipping settings");
    return;
  }

  const content = await readFile(CUSTOM_CONFIG, "utf-8");
  const opencodeConfig = JSON.parse(content);

  // Transform OpenCode config to Claude Code settings format
  const claudeSettings: Record<string, unknown> = {};

  // Transform permissions if present
  if (opencodeConfig.permission) {
    const allow: string[] = [];
    const deny: string[] = [];

    // Transform external_directory permissions
    if (opencodeConfig.permission.external_directory) {
      for (const [path, rule] of Object.entries(opencodeConfig.permission.external_directory)) {
        if (path === "*") continue; // Skip wildcard
        const normalizedPath = path.replace("<home>", "~");
        if (rule === "allow") {
          allow.push(`Edit(${normalizedPath})`);
          allow.push(`Read(${normalizedPath})`);
        } else if (rule === "deny") {
          deny.push(`Edit(${normalizedPath})`);
          deny.push(`Read(${normalizedPath})`);
        }
      }
    }

    // Transform read permissions
    if (opencodeConfig.permission.read) {
      for (const [pattern, rule] of Object.entries(opencodeConfig.permission.read)) {
        if (rule === "allow") {
          allow.push(`Read(${pattern})`);
        } else if (rule === "deny") {
          deny.push(`Read(${pattern})`);
        }
      }
    }

    if (allow.length > 0 || deny.length > 0) {
      claudeSettings.permissions = {};
      if (allow.length > 0) (claudeSettings.permissions as Record<string, unknown>).allow = allow;
      if (deny.length > 0) (claudeSettings.permissions as Record<string, unknown>).deny = deny;
    }
  }

  await writeFile(
    join(CLAUDE_DIR, "settings.json"),
    JSON.stringify(claudeSettings, null, 2) + "\n"
  );
  console.log("    Generated settings.json");
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log("\nGenerating files for OpenCode and Claude Code...\n");

  if (!existsSync(CONTENT_DIR)) {
    console.error(`ERROR: Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  if (!existsSync(SKILLS_DIR)) {
    console.error(`ERROR: Skills directory not found: ${SKILLS_DIR}`);
    process.exit(1);
  }

  // Always clean output directory
  if (existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true });
  }

  // Create output structures for both tools
  await ensureDir(join(OPENCODE_DIR, "skills"));
  await ensureDir(join(OPENCODE_DIR, "plugin"));
  await ensureDir(join(CLAUDE_DIR, "skills"));

  // Generate OpenCode
  console.log("OpenCode:");
  const opcSkillCount = await generateOpencodeSkills();
  const opcPluginCount = await copyOpencodePlugins();
  await generateOpencodeConfig();

  console.log();

  // Generate Claude Code
  console.log("Claude Code:");
  const ccSkillCount = await generateClaudeSkills();
  await generateClaudeSettings();

  console.log("\n" + "=".repeat(50));
  console.log("Generation complete!");
  console.log("=".repeat(50));
  console.log(`\nOutput directories:`);
  console.log(`  OpenCode:    ${OPENCODE_DIR}/`);
  console.log(`  Claude Code: ${CLAUDE_DIR}/`);
  console.log(`\nSummary:`);
  console.log(`  OpenCode:    ${opcSkillCount} skills, ${opcPluginCount} plugins`);
  console.log(`  Claude Code: ${ccSkillCount} skills`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
