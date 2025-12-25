#!/usr/bin/env bun

/**
 * Generator Script
 * Generates integration files from templates + config for all platforms
 *
 * Usage: bun generate.ts [--clean]
 */

import { readdir, readFile, writeFile, mkdir, rm, cp } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";

// =============================================================================
// Configuration
// =============================================================================

const SCRIPT_DIR = import.meta.dir;
const TEMPLATES_DIR = join(SCRIPT_DIR, "templates");
const OUTPUT_DIR = join(SCRIPT_DIR, "integrations");
const MCP_FILE = join(SCRIPT_DIR, "mcp.json");

// Model Configuration
// Smart models: For complex tasks (auditor, planning)
// Fast models: For quick tasks (scout, title generation)
const CONFIG = {
  opencode: {
    modelSmart: "anthropic/claude-opus-4-5",
    modelFast: "opencode/gemini-3-flash",
  },
  claude: {
    modelSmart: "sonnet",
    modelFast: "haiku",
  },
};

// =============================================================================
// Skill Descriptions
// =============================================================================

const SKILL_DESCRIPTIONS: Record<string, string> = {
  planning:
    "Create structured implementation plans with scope, phases, and risks. Use when user wants to plan a feature, architect a solution, design an approach, or says 'let's plan', 'create a plan', 'how should we build this', or needs to break down work into steps.",
  execution:
    "Implement approved plans into production-ready code. Use when user wants to build, implement, code, or execute an approved plan. Activates when user says 'let's build', 'implement this', 'start coding', or 'execute the plan'.",
  workshop:
    "Explore and stress-test ideas before building. Use when user wants to brainstorm, think through an approach, explore options, discuss trade-offs, or says 'let's workshop this', 'think through', 'explore idea', or 'brainstorm'.",
  reflection:
    "Audit completed work to find gaps, risks, and next steps. Use when user wants to review what was built, audit code, find gaps, or says 'let's reflect', 'audit this', 'what did we miss', or 'review the work'.",
  "code-review":
    "Review code changes for bugs, security, and design issues. Use when user wants to review code, check a PR, review changes, or says 'review this', 'check my code', 'PR review', or 'code review'.",
  debugging:
    "Systematically investigate and fix bugs with evidence-based diagnosis. Use when user mentions a bug, error, something not working, unexpected behavior, or says 'debug this', 'why is this broken', 'fix this bug', or describes symptoms of a problem.",
  refactoring:
    "Restructure code without changing behavior. Use when user wants to refactor, clean up code, restructure, or says 'refactor this', 'clean this up', 'this code is messy', or identifies code smells to fix.",
  translation:
    "Review translations for quality, naturalness, and cultural fit. Use when user wants to review translations, check i18n files, or says 'review translations', 'check localization', or mentions translation quality issues.",
  "api-handoff":
    "Create API handoff documentation for frontend developers. Use when backend work is complete and needs to be documented for frontend integration, or user says 'create handoff', 'document API', 'frontend handoff', or 'API documentation'.",
  "backend-requirements":
    "Document frontend data needs for backend developers. Use when frontend needs to communicate API requirements to backend, or user says 'backend requirements', 'what data do I need', 'API requirements', or is describing data needs for a UI.",
  "product-strategy":
    "Find 10x product opportunities and high-leverage improvements. Use when user wants strategic product thinking, mentions '10x', wants to find high-impact features, or says 'what would make this 10x better', 'product strategy', or 'what should we build next'.",
  "feature-research":
    "Deep research on features before building with co-founder mindset. Use when user wants to research a feature idea, explore if something is worth building, or says 'research this feature', 'is this worth building', 'explore this idea', or wants product + market + tech analysis.",
  "prompt-enhancer":
    "Fast prompt enhancement with codebase context. Use when user wants to enhance a prompt, improve a question, or says 'enhance this', 'improve prompt', '/enhance', or wants better context before asking Claude. Responds in under 10 seconds.",
  "user-story-review":
    "Review user stories from a developer perspective. Use when user wants to review user stories, check story quality, or says 'review this story', 'is this story clear', 'story feedback', or has user stories that need developer review before implementation.",
  "full-feature":
    "Manage full feature lifecycle from exploration to delivery. Use when building new features, implementing complete functionality, or when user mentions 'feature mode', 'full feature', or wants to go through Workshop, Plan, Execute, and Reflection phases systematically.",
};

const WORKFLOW_NAME_MAP: Record<string, string> = {
  planning: "plan-mode",
  execution: "execute-mode",
  debugging: "debug-mode",
  refactoring: "refactor-mode",
  "product-strategy": "10x-mode",
  "user-story-review": "refine-user-story-mode",
};

// =============================================================================
// Utilities
// =============================================================================

function getSkillDescription(name: string): string {
  return SKILL_DESCRIPTIONS[name] || `${name} skill`;
}

function getWorkflowName(name: string): string {
  return WORKFLOW_NAME_MAP[name] || `${name}-mode`;
}

function stripEmojis(content: string): string {
  return content
    .replace(/[✅❌🔴🟡🟢⚠️🔄🔨💔🐘🎯💎🔥👍🤔]/g, "")
    .replace(/ {2,}/g, " ")
    .replace(/ \|/g, "|")
    .replace(/\| /g, "|");
}

async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

// =============================================================================
// Skill Generation
// =============================================================================

async function generateClaudeCodeSkills(): Promise<number> {
  console.log("  Generating Claude Code skills...");

  const outputDir = join(OUTPUT_DIR, "claude-code", "skills");
  await ensureDir(outputDir);

  const skillsDir = join(TEMPLATES_DIR, "skills");
  const files = await readdir(skillsDir);
  let count = 0;

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const name = basename(file, ".md");
    const skillDir = join(outputDir, name);
    await ensureDir(skillDir);

    const template = await readFile(join(skillsDir, file), "utf-8");
    const description = getSkillDescription(name);

    const content = `---
name: ${name}
description: ${description}
---

${template}`;

    await writeFile(join(skillDir, "SKILL.md"), content);
    count++;
  }

  // Handle full-feature templates subdirectory
  const fullFeatureTemplates = join(TEMPLATES_DIR, "skills", "full-feature", "templates");
  if (existsSync(fullFeatureTemplates)) {
    const destDir = join(outputDir, "full-feature", "templates");
    await ensureDir(destDir);
    await cp(fullFeatureTemplates, destDir, { recursive: true });
  }

  console.log(`    Generated ${count} skills`);
  return count;
}

async function generateOpenCodeSkills(): Promise<void> {
  console.log("  Generating OpenCode skills...");

  const sourceDir = join(OUTPUT_DIR, "claude-code", "skills");
  const outputDir = join(OUTPUT_DIR, "opencode", "skills");

  if (!existsSync(sourceDir)) {
    throw new Error("Claude Code skills not generated yet");
  }

  await ensureDir(outputDir);
  await cp(sourceDir, outputDir, { recursive: true });

  console.log("    Copied skills from Claude Code (shared format)");
}

// =============================================================================
// Workflow Generation (Windsurf)
// =============================================================================

async function generateWindsurfWorkflows(): Promise<number> {
  console.log("  Generating Windsurf workflows...");

  const outputDir = join(OUTPUT_DIR, "windsurf", "workflows");
  await ensureDir(outputDir);

  const skillsDir = join(TEMPLATES_DIR, "skills");
  const files = await readdir(skillsDir);
  let count = 0;

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const name = basename(file, ".md");
    const workflowName = getWorkflowName(name);
    const template = await readFile(join(skillsDir, file), "utf-8");
    const description = getSkillDescription(name);

    const content = `---
description: ${description}
---

${template}`;

    await writeFile(join(outputDir, `${workflowName}.md`), content);
    count++;
  }

  console.log(`    Generated ${count} workflows`);
  return count;
}

// =============================================================================
// Agent Generation
// =============================================================================

async function generateClaudeCodeAgents(): Promise<number> {
  console.log("  Generating Claude Code sub-agents...");

  const outputDir = join(OUTPUT_DIR, "claude-code", "sub-agents");
  await ensureDir(outputDir);

  let count = 0;

  // Auditor
  const auditorPath = join(TEMPLATES_DIR, "agents", "auditor.md");
  if (existsSync(auditorPath)) {
    const template = await readFile(auditorPath, "utf-8");
    const content = `---
name: auditor
description: Code auditor. Runs ONCE after execute phase completes. Audits all changes with full context and returns APPROVED or REJECTED. Main agent cannot self-approve—task is never done without audit approval.
tools: Read, Glob, Grep, Write
model: ${CONFIG.claude.modelSmart}
---

${template}`;
    await writeFile(join(outputDir, "auditor.md"), content);
    count++;
  }

  // Scout
  const scoutPath = join(TEMPLATES_DIR, "agents", "scout.md");
  if (existsSync(scoutPath)) {
    const template = await readFile(scoutPath, "utf-8");
    const content = `---
name: scout
description: Ultra-fast codebase scanner. Returns paths/names only. Use for quick context gathering.
tools: Glob, Grep
model: ${CONFIG.claude.modelFast}
---

${template}`;
    await writeFile(join(outputDir, "scout.md"), content);
    count++;
  }

  console.log(`    Generated ${count} sub-agents`);
  return count;
}

async function generateOpenCodeAgents(): Promise<number> {
  console.log("  Generating OpenCode agents...");

  const outputDir = join(OUTPUT_DIR, "opencode", "agents");
  await ensureDir(outputDir);

  let count = 0;

  // Auditor (subagent, strip emojis)
  const auditorPath = join(TEMPLATES_DIR, "agents", "auditor.md");
  if (existsSync(auditorPath)) {
    const template = await readFile(auditorPath, "utf-8");
    const content = `---
description: Code auditor. Runs ONCE after execute phase completes. Audits all changes with full context and returns APPROVED or REJECTED. Main agent cannot self-approve—task is never done without audit approval.
mode: subagent
model: ${CONFIG.opencode.modelSmart}
tools:
  write: true
  edit: false
  bash: false
permission:
  edit: deny
  bash:
    "*": deny
---

${stripEmojis(template)}`;
    await writeFile(join(outputDir, "auditor.md"), content);
    count++;
  }

  // Scout (subagent)
  const scoutPath = join(TEMPLATES_DIR, "agents", "scout.md");
  if (existsSync(scoutPath)) {
    const template = await readFile(scoutPath, "utf-8");
    const content = `---
description: Ultra-fast codebase scanner. Returns paths/names only. Use for quick context gathering when you need to find files by pattern or search for code quickly.
mode: subagent
model: ${CONFIG.opencode.modelFast}
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash:
    "*": deny
---

${template}`;
    await writeFile(join(outputDir, "scout.md"), content);
    count++;
  }

  // Plan (primary agent, strip emojis)
  const planPath = join(TEMPLATES_DIR, "agents", "plan.md");
  if (existsSync(planPath)) {
    const template = await readFile(planPath, "utf-8");
    const content = `---
description: Create structured implementation plans with scope, phases, and risks. Use when user wants to plan a feature, architect a solution, design an approach, or says "let's plan", "create a plan", "how should we build this", or needs to break down work into steps.
mode: primary
permission:
  edit: deny
  bash:
    "git diff*": allow
    "git log*": allow
    "git show*": allow
    "git status*": allow
    "git branch*": allow
    "grep*": allow
    "rg*": allow
    "find*": allow
    "ls*": allow
    "head*": allow
    "tail*": allow
    "cat*": allow
    "tree*": allow
    "wc*": allow
    "file *": allow
    "stat*": allow
    "*": ask
---

${stripEmojis(template)}`;
    await writeFile(join(outputDir, "plan.md"), content);
    count++;
  }

  // Build (primary agent - overrides OpenCode's built-in build with execution skill)
  const executionPath = join(TEMPLATES_DIR, "skills", "execution.md");
  if (existsSync(executionPath)) {
    const template = await readFile(executionPath, "utf-8");
    const content = `---
description: Implement approved plans into production-ready code. Overrides OpenCode's built-in build agent with structured execution workflow including audit gates.
mode: primary
model: ${CONFIG.opencode.modelSmart}
---

${stripEmojis(template)}`;
    await writeFile(join(outputDir, "build.md"), content);
    count++;
  }

  // Quick Edits (primary agent - fast model for simple changes)
  const quickEditsPath = join(TEMPLATES_DIR, "agents", "quick-edits.md");
  if (existsSync(quickEditsPath)) {
    const template = await readFile(quickEditsPath, "utf-8");
    const content = `---
description: Fast, focused editing for simple changes. Use for quick fixes, small refactors, and straightforward edits that don't need full planning or audit cycles.
mode: primary
model: ${CONFIG.opencode.modelFast}
---

${stripEmojis(template)}`;
    await writeFile(join(outputDir, "quick-edits.md"), content);
    count++;
  }

  // Prompt Enhance (primary agent - fast model for quick context gathering)
  const promptEnhancePath = join(TEMPLATES_DIR, "agents", "prompt-enhance.md");
  if (existsSync(promptEnhancePath)) {
    const template = await readFile(promptEnhancePath, "utf-8");
    const content = `---
description: Fast prompt enhancement with codebase context. Use when user wants to enhance a prompt, improve a question, or says 'enhance this', 'improve prompt', or wants better context before asking. Responds in under 10 seconds.
mode: primary
model: ${CONFIG.opencode.modelFast}
---

${stripEmojis(template)}`;
    await writeFile(join(outputDir, "prompt-enhance.md"), content);
    count++;
  }

  // Frontend Design (primary agent - fast model for UI/visual work)
  const frontendDesignPath = join(TEMPLATES_DIR, "agents", "frontend-design.md");
  if (existsSync(frontendDesignPath)) {
    const template = await readFile(frontendDesignPath, "utf-8");
    const content = `---
description: UI/UX focused editing for visual changes only. Use for styling, layout, animations, typography, and design system work. No logic changes. Supports ULTRATHINK trigger for deep design analysis.
mode: primary
model: ${CONFIG.opencode.modelFast}
---

${stripEmojis(template)}`;
    await writeFile(join(outputDir, "frontend-design.md"), content);
    count++;
  }

  console.log(`    Generated ${count} agents`);
  return count;
}

// =============================================================================
// MCP Config Generation
// =============================================================================

interface ClaudeMcpServer {
  command: string;
  args: string[];
}

interface OpenCodeMcpServer {
  type: "local" | "remote";
  command?: string[];
  url?: string;
}

async function generateMcpConfigs(): Promise<void> {
  console.log("  Generating MCP configs...");

  if (!existsSync(MCP_FILE)) {
    console.log("    No mcp.json found, skipping");
    return;
  }

  const mcpContent = await readFile(MCP_FILE, "utf-8");
  const mcpServers: Record<string, ClaudeMcpServer> = JSON.parse(mcpContent);

  // Claude Code format - wrap in mcpServers
  const claudeDir = join(OUTPUT_DIR, "claude-code");
  await ensureDir(claudeDir);

  const claudeMcp = { mcpServers };
  await writeFile(
    join(claudeDir, "mcp.json"),
    JSON.stringify(claudeMcp, null, 2)
  );

  // OpenCode format - convert to { type: "local", command: [...] }
  const opencodeDir = join(OUTPUT_DIR, "opencode");
  await ensureDir(opencodeDir);

  const opencodeMcp: Record<string, OpenCodeMcpServer> = {};
  for (const [name, server] of Object.entries(mcpServers)) {
    opencodeMcp[name] = {
      type: "local",
      command: [server.command, ...server.args],
    };
  }

  await writeFile(
    join(opencodeDir, "mcp.json"),
    JSON.stringify(opencodeMcp, null, 2)
  );

  console.log("    Generated MCP configs for Claude Code and OpenCode");
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const clean = args.includes("--clean") || args.includes("-c");

  console.log("\nGenerating integration files from templates...\n");

  // Validate templates exist
  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`ERROR: Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  // Clean output directory if requested
  if (clean && existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true });
  }

  // Create output structure
  await ensureDir(join(OUTPUT_DIR, "claude-code", "skills"));
  await ensureDir(join(OUTPUT_DIR, "claude-code", "sub-agents"));
  await ensureDir(join(OUTPUT_DIR, "opencode", "skills"));
  await ensureDir(join(OUTPUT_DIR, "opencode", "agents"));
  await ensureDir(join(OUTPUT_DIR, "windsurf", "workflows"));

  // Generate all files
  const claudeSkills = await generateClaudeCodeSkills();
  await generateOpenCodeSkills();
  const workflows = await generateWindsurfWorkflows();
  const claudeAgents = await generateClaudeCodeAgents();
  const opencodeAgents = await generateOpenCodeAgents();
  await generateMcpConfigs();

  console.log("\nGeneration complete!");
  console.log(`Output: ${OUTPUT_DIR}/\n`);

  console.log("Summary:");
  console.log(`  Claude Code:`);
  console.log(`    - Skills: ${claudeSkills}`);
  console.log(`    - Sub-agents: ${claudeAgents}`);
  console.log(`    - MCP config: 1`);
  console.log(`  OpenCode:`);
  console.log(`    - Skills: ${claudeSkills}`);
  console.log(`    - Agents: ${opencodeAgents}`);
  console.log(`  Windsurf:`);
  console.log(`    - Workflows: ${workflows}`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
