#!/usr/bin/env bun

/**
 * Generator Script
 * Generates OpenCode files from content + config
 *
 * Usage: bun generate.ts
 */

import { readdir, readFile, writeFile, mkdir, rm, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { MODELS } from "./config/models";
import { AGENTS } from "./config/agents";
import { SKILLS } from "./config/skills";

// =============================================================================
// Paths
// =============================================================================

const SCRIPT_DIR = import.meta.dir;
const CONTENT_DIR = join(SCRIPT_DIR, "content");
const INSTRUCTIONS_DIR = join(CONTENT_DIR, "instructions");
const CHECKLISTS_DIR = join(CONTENT_DIR, "checklists");
const PLUGINS_DIR = join(SCRIPT_DIR, "plugins");
const OUTPUT_DIR = join(SCRIPT_DIR, "output");
const OPENCODE_DIR = join(OUTPUT_DIR, "opencode");


// =============================================================================
// Utilities
// =============================================================================

async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

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

async function readChecklist(name: string): Promise<string | null> {
  const path = join(CHECKLISTS_DIR, `${name}.md`);
  if (!existsSync(path)) {
    return null;
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
    let template = await readInstruction(config.instruction);

    // For specialized auditors, merge base auditor + checklist
    if (config.checklist) {
      const baseAuditor = await readInstruction("auditor");
      const checklist = await readChecklist(config.checklist);
      if (checklist) {
        template = `${baseAuditor}\n\n---\n\n# Specialized Focus: ${config.description}\n\n${checklist}`;
      }
    }

    // For skills used as auditors, append checklist if available
    if (config.appendChecklist) {
      const checklist = await readChecklist(config.appendChecklist);
      if (checklist) {
        template = `${template}\n\n---\n\n# Checklist\n\n${checklist}`;
      }
    }

    const frontmatter: Record<string, unknown> = {
      description: config.description,
      model: MODELS[config.model],
      mode: config.type === "sub" ? "subagent" : "primary",
    };

    if (config.tools) frontmatter.tools = config.tools;
    if (config.permission) frontmatter.permission = config.permission;
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
    let template = await readInstruction(config.instruction);

    // Append checklist if skill has one
    if (config.checklist) {
      const checklist = await readChecklist(config.checklist);
      if (checklist) {
        template = `${template}\n\n---\n\n# Checklist\n\n${checklist}`;
      }
    }

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

  const pluginsOutDir = join(OPENCODE_DIR, "plugin");
  await ensureDir(pluginsOutDir);

  const files = await readdir(PLUGINS_DIR);
  let count = 0;

  for (const file of files) {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      await copyFile(join(PLUGINS_DIR, file), join(pluginsOutDir, file));
      count++;
    }
  }

  console.log(`    Copied ${count} plugins`);
  return count;
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

  // Generate
  const agentCount = await generateAgents();
  const skillCount = await generateSkills();
  const pluginCount = await copyPlugins();

  console.log("\nGeneration complete!");
  console.log(`Output: ${OPENCODE_DIR}/\n`);
  console.log("Summary:");
  console.log(`  Agents: ${agentCount}`);
  console.log(`  Skills: ${skillCount}`);
  console.log(`  Plugins: ${pluginCount}`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
