#!/usr/bin/env bun

/**
 * Generator Script
 * Generates OpenCode files from content + config
 *
 * Usage: bun src/generate.ts
 */

import { readFile, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { MODELS } from "../config/models";
import { AGENTS } from "../config/agents";
import { SKILLS } from "../config/skills";
import { ensureDir, copyDirAsync } from "./fs";

// =============================================================================
// Paths
// =============================================================================

const ROOT_DIR = join(import.meta.dir, "..");
const CONTENT_DIR = join(ROOT_DIR, "content");
const INSTRUCTIONS_DIR = join(CONTENT_DIR, "instructions");
const COMMANDS_DIR = join(CONTENT_DIR, "commands");
const PLUGINS_DIR = join(ROOT_DIR, "plugins");
const OUTPUT_DIR = join(ROOT_DIR, "output");
const OPENCODE_DIR = join(OUTPUT_DIR, "opencode");
const CUSTOM_CONFIG = join(ROOT_DIR, "custom-opencode.json");

// =============================================================================
// Utilities
// =============================================================================

function toYaml(obj: Record<string, unknown>, indent = 0): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null) {
      lines.push(`${pad}${key}:`);
      lines.push(toYaml(value as Record<string, unknown>, indent + 1));
    } else {
      const formattedKey = key.includes("*") ? `"${key}"` : key;
      lines.push(`${pad}${formattedKey}: ${value}`);
    }
  }

  return lines.join("\n");
}

async function readInstruction(name: string): Promise<string> {
  const path = join(INSTRUCTIONS_DIR, `${name}.md`);
  if (!existsSync(path)) {
    throw new Error(`Instruction file not found: ${path}`);
  }
  return readFile(path, "utf-8");
}

// =============================================================================
// Generators
// =============================================================================

async function generateAgents(): Promise<number> {
  console.log("  Generating agents...");

  const agentsDir = join(OPENCODE_DIR, "agents");
  await ensureDir(agentsDir);
  let count = 0;

  for (const [name, config] of Object.entries(AGENTS)) {
    const template = await readInstruction(config.instruction);

    const frontmatter: Record<string, unknown> = {
      description: config.description,
      model: MODELS[config.model],
      mode: config.type === "sub" ? "subagent" : "primary",
      ...(config.additional ?? {}),
    };

    if (config.color) frontmatter.color = `"${config.color}"`;

    const content = `---
${toYaml(frontmatter)}
---

${template}`;

    await writeFile(join(agentsDir, `${name}.md`), content);
    count++;
  }

  console.log(`    Generated ${count} agents`);
  return count;
}

async function generateSkills(): Promise<number> {
  console.log("  Generating skills...");

  const skillsDir = join(OPENCODE_DIR, "skills");
  let count = 0;

  for (const [name, config] of Object.entries(SKILLS)) {
    const template = await readInstruction(config.instruction);

    const content = `---
name: ${name}
description: ${config.description}
---

${template}`;

    const skillDir = join(skillsDir, name);
    await ensureDir(skillDir);
    await writeFile(join(skillDir, "SKILL.md"), content);
    count++;
  }

  console.log(`    Generated ${count} skills`);
  return count;
}

async function copyPlugins(): Promise<number> {
  console.log("  Copying plugins...");

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

async function copyCommands(): Promise<number> {
  console.log("  Copying commands...");

  if (!existsSync(COMMANDS_DIR)) {
    console.log("    No commands directory found, skipping");
    return 0;
  }

  const count = await copyDirAsync({
    src: COMMANDS_DIR,
    dest: join(OPENCODE_DIR, "command"),
    mode: "clean",
    extensions: [".md"],
  });

  console.log(`    Copied ${count} commands`);
  return count;
}

async function generateOpencodeConfig(): Promise<void> {
  console.log("  Generating opencode config...");

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
// Main
// =============================================================================

async function main() {
  console.log("\nGenerating OpenCode files from content...\n");

  if (!existsSync(CONTENT_DIR)) {
    console.error(`ERROR: Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  // Always clean output directory
  if (existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true });
  }

  // Create output structure
  await ensureDir(join(OPENCODE_DIR, "agents"));
  await ensureDir(join(OPENCODE_DIR, "skills"));
  await ensureDir(join(OPENCODE_DIR, "plugin"));
  await ensureDir(join(OPENCODE_DIR, "command"));

  // Generate
  const agentCount = await generateAgents();
  const skillCount = await generateSkills();
  const pluginCount = await copyPlugins();
  const commandCount = await copyCommands();
  await generateOpencodeConfig();

  console.log("\nGeneration complete!");
  console.log(`Output: ${OPENCODE_DIR}/\n`);
  console.log("Summary:");
  console.log(`  Agents: ${agentCount}`);
  console.log(`  Skills: ${skillCount}`);
  console.log(`  Plugins: ${pluginCount}`);
  console.log(`  Commands: ${commandCount}`);
  console.log(`  Config: opencode-config.json`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
