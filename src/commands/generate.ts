#!/usr/bin/env bun

/**
 * Internal generator used by `mise run install`.
 */

import { writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { CODEX_CONFIG } from "../../config/codex";
import { createOpencodeConfig } from "../../config/opencode";
import { ensureDir } from "../lib/fs";

// =============================================================================
// Paths
// =============================================================================

const ROOT_DIR = join(import.meta.dir, "..", "..");
const CONTENT_DIR = join(ROOT_DIR, "content");
const OUTPUT_DIR = join(ROOT_DIR, "output");

// Tool-specific output directories
const OPENCODE_DIR = join(OUTPUT_DIR, "opencode");
const CODEX_DIR = join(OUTPUT_DIR, "codex");

// =============================================================================
// OpenCode Generators
// =============================================================================

async function generateOpencodeConfig(): Promise<void> {
  console.log("  [OpenCode] Generating config...");

  await writeFile(
    join(OPENCODE_DIR, "opencode-config.json"),
    JSON.stringify(createOpencodeConfig("<home>"), null, 2) + "\n",
  );
  console.log("    Generated opencode-config.json");
}

// =============================================================================
// Codex Generators
// =============================================================================

async function generateCodexConfig(): Promise<void> {
  console.log("  [Codex] Generating config...");

  const lines: string[] = [
    "# Managed by my-setup. Do not edit by hand.",
    "# Source of truth: config/codex.ts",
    "",
    `model_verbosity = ${JSON.stringify(CODEX_CONFIG.model_verbosity)}`,
    "",
    "[agents]",
    `max_threads = ${CODEX_CONFIG.agents.max_threads}`,
    "",
    "[features]",
    `default_mode_request_user_input = ${CODEX_CONFIG.features.default_mode_request_user_input}`,
    "",
  ];

  await writeFile(join(CODEX_DIR, "config.toml"), lines.join("\n"));
  console.log("    Generated config.toml");
}

export async function generate(): Promise<void> {
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
  await ensureDir(OPENCODE_DIR);

  // Generate OpenCode
  console.log("OpenCode:");
  await generateOpencodeConfig();

  console.log();

  // Generate Codex
  console.log("Codex:");
  await generateCodexConfig();

  console.log("\n" + "=".repeat(50));
  console.log("Generation complete!");
  console.log("=".repeat(50));
  console.log(`\nOutput directories:`);
  console.log(`  OpenCode:    ${OPENCODE_DIR}/`);
  console.log(`  Codex:       ${CODEX_DIR}/`);
  console.log(`\nSummary:`);
  console.log(`  OpenCode:    config`);
  console.log(`  Codex:       config`);
}

if (import.meta.main) {
  generate().catch((err: Error) => {
    console.error("ERROR:", err.message);
    process.exit(1);
  });
}
