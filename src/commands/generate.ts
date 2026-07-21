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
import { compactOutput } from "../lib/print";

function log(message = ""): void {
  if (!compactOutput) console.log(message);
}

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
  log("  [OpenCode] Generating config...");

  await writeFile(
    join(OPENCODE_DIR, "opencode-config.json"),
    JSON.stringify(createOpencodeConfig("<home>"), null, 2) + "\n",
  );
  log("    Generated opencode-config.json");
}

// =============================================================================
// Codex Generators
// =============================================================================

async function generateCodexConfig(): Promise<void> {
  log("  [Codex] Generating config...");

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
  log("    Generated config.toml");
}

export async function generate(): Promise<void> {
  log("\nGenerating files for OpenCode and Codex...\n");

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
  log("OpenCode:");
  await generateOpencodeConfig();

  log();

  // Generate Codex
  log("Codex:");
  await generateCodexConfig();

  log("\n" + "=".repeat(50));
  log("Generation complete!");
  log("=".repeat(50));
  log(`\nOutput directories:`);
  log(`  OpenCode:    ${OPENCODE_DIR}/`);
  log(`  Codex:       ${CODEX_DIR}/`);
  log(`\nSummary:`);
  log(`  OpenCode:    config`);
  log(`  Codex:       config`);
}

if (import.meta.main) {
  generate().catch((err: Error) => {
    console.error("ERROR:", err.message);
    process.exit(1);
  });
}
