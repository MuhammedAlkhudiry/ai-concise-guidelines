#!/usr/bin/env bun

/**
 * Generator Script
 * Generates files for OpenCode and Codex from content
 *
 * Usage: bun src/generate.ts
 */

import { readFile, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { MODELS } from "../config/models";
import { MCP_SERVERS } from "../config/mcp";
import { ensureDir, copyDirAsync } from "./fs";

// =============================================================================
// Paths
// =============================================================================

const ROOT_DIR = join(import.meta.dir, "..");
const CONTENT_DIR = join(ROOT_DIR, "content");
const PLUGINS_DIR = join(ROOT_DIR, "plugins");
const OUTPUT_DIR = join(ROOT_DIR, "output");

// Tool-specific output directories
const OPENCODE_DIR = join(OUTPUT_DIR, "opencode");
const CODEX_DIR = join(OUTPUT_DIR, "codex");

// Config files
const CUSTOM_CONFIG = join(ROOT_DIR, "custom-opencode.json");

// =============================================================================
// OpenCode Generators
// =============================================================================

async function copyOpencodePlugins(): Promise<number> {
  console.log("  [OpenCode] Copying plugins...");

  if (!existsSync(PLUGINS_DIR)) {
    console.log("    No plugins directory found, skipping");
    return 0;
  }

  const count = await copyDirAsync({
    src: PLUGINS_DIR,
    dest: join(OPENCODE_DIR, "plugin"),
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

  const config = JSON.parse(processed) as Record<string, unknown>;
  config.mcp = MCP_SERVERS;

  await writeFile(
    join(OPENCODE_DIR, "opencode-config.json"),
    JSON.stringify(config, null, 2) + "\n"
  );
  console.log("    Generated opencode-config.json");
}

// =============================================================================
// Codex Generators
// =============================================================================

function toTomlString(value: string): string {
  return JSON.stringify(value);
}

async function generateCodexMcpConfig(): Promise<number> {
  console.log("  [Codex] Generating MCP config...");

  const serverNames = Object.keys(MCP_SERVERS).sort();
  const lines: string[] = [
    "# Managed by ai-concise-guidelines. Do not edit by hand.",
    "# Source of truth: config/mcp.ts",
    "",
  ];

  for (const serverName of serverNames) {
    const server = MCP_SERVERS[serverName];
    lines.push(`[mcp_servers.${serverName}]`);

    if (server.type === "local") {
      const [command, ...args] = server.command;
      lines.push(`command = ${toTomlString(command)}`);
      lines.push(`args = [${args.map(toTomlString).join(", ")}]`);
    }

    if (server.type === "remote") {
      lines.push(`url = ${toTomlString(server.url)}`);
    }

    lines.push("");
  }

  await writeFile(join(CODEX_DIR, "mcp-servers.toml"), lines.join("\n"));
  console.log(`    Generated mcp-servers.toml (${serverNames.length} servers)`);
  return serverNames.length;
}

async function main() {
  console.log("\nGenerating files for OpenCode and Codex...\n");

  if (!existsSync(CONTENT_DIR)) {
    console.error(`ERROR: Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  // Always clean output directory
  if (existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true });
  }

  // Create output structures for supported tools
  await ensureDir(CODEX_DIR);
  await ensureDir(join(OPENCODE_DIR, "plugin"));

  // Generate OpenCode
  console.log("OpenCode:");
  const opcPluginCount = await copyOpencodePlugins();
  await generateOpencodeConfig();

  console.log();

  // Generate Codex
  console.log("Codex:");
  const codexMcpCount = await generateCodexMcpConfig();

  console.log("\n" + "=".repeat(50));
  console.log("Generation complete!");
  console.log("=".repeat(50));
  console.log(`\nOutput directories:`);
  console.log(`  OpenCode:    ${OPENCODE_DIR}/`);
  console.log(`  Codex:       ${CODEX_DIR}/`);
  console.log(`\nSummary:`);
  console.log(`  OpenCode:    ${opcPluginCount} plugins`);
  console.log(`  Codex:       ${codexMcpCount} MCP servers`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
