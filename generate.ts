#!/usr/bin/env bun

/**
 * Generator Script
 * Generates OpenCode files from content + config
 *
 * Usage: bun generate.ts [--clean]
 */

import { readdir, readFile, writeFile, mkdir, rm } from "fs/promises";
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
const OUTPUT_DIR = join(SCRIPT_DIR, "output");
const OPENCODE_DIR = join(OUTPUT_DIR, "opencode");
const MCP_FILE = join(SCRIPT_DIR, "mcp.json");

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

async function generateConfigs(): Promise<void> {
  console.log("  Generating configs...");

  // Build MCP config from mcp.json
  let mcp: Record<string, unknown> = {};
  if (existsSync(MCP_FILE)) {
    const mcpServers = JSON.parse(await readFile(MCP_FILE, "utf-8"));
    for (const [name, server] of Object.entries(mcpServers)) {
      const s = server as { command: string; args: string[] };
      mcp[name] = { type: "local", command: [s.command, ...s.args] };
    }
  }

  // Complete OpenCode config (everything in one file)
  const opencodeConfig = {
    model: MODELS.smart,
    small_model: MODELS.fast,
    provider: {
      anthropic: {
        models: {
          "claude-sonnet-4-5": {
            options: {
              thinking: { type: "enabled", budgetTokens: 16000 },
            },
          },
          "claude-opus-4-5": {
            options: {
              thinking: { type: "enabled", budgetTokens: 32000 },
            },
          },
          "claude-haiku-4-5": {
            options: {
              thinking: { type: "enabled", budgetTokens: 10000 },
            },
          },
        },
      },
    },
    plugin: [
      "opencode-gemini-auth",
      "@tarquinen/opencode-dcp@latest",
    ],
    agent: {
      // Disable built-in agents (coordinator replaces them)
      plan: { disable: true },
      build: { disable: true },
      // Configure built-in subagents
      explore: { model: MODELS.fast },
      general: { model: MODELS.smart },
    },
    mcp,
  };

  await writeFile(
    join(OPENCODE_DIR, "opencode.json"),
    JSON.stringify(opencodeConfig, null, 2)
  );
  console.log("    Generated opencode.json");
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const clean = process.argv.includes("--clean") || process.argv.includes("-c");

  console.log("\nGenerating OpenCode files from content...\n");

  if (!existsSync(CONTENT_DIR)) {
    console.error(`ERROR: Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  if (clean && existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true });
  }

  // Create output structure
  await ensureDir(join(OPENCODE_DIR, "agents"));
  await ensureDir(join(OPENCODE_DIR, "skills"));

  // Generate
  const agentCount = await generateAgents();
  const skillCount = await generateSkills();
  await generateConfigs();

  console.log("\nGeneration complete!");
  console.log(`Output: ${OPENCODE_DIR}/\n`);
  console.log("Summary:");
  console.log(`  Agents: ${agentCount}`);
  console.log(`  Skills: ${skillCount}`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
