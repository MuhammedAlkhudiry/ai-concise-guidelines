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

const MODELS = {
  opencode: {
    smart: "anthropic/claude-opus-4-5",
    fast: "anthropic/claude-haiku-4-5",
  },
  claude: {
    smart: "opus",
    fast: "haiku",
  },
};

// =============================================================================
// Agent Configuration
// =============================================================================

interface AgentConfig {
  template: string;
  description: string;
  modelType: "smart" | "fast";
  claudeCode?: { tools: string };
  opencode?: {
    mode: "primary" | "subagent";
    tools?: Record<string, boolean>;
    permission?: Record<string, unknown>;
  };
}

const AGENT_CONFIGS: Record<string, AgentConfig> = {
  auditor: {
    template: "agents/auditor.md",
    description:
      "Code auditor. Runs ONCE after execute phase completes. Audits all changes with full context and returns APPROVED or REJECTED. Main agent cannot self-approve—task is never done without audit approval.",
    modelType: "smart",
    claudeCode: { tools: "Read, Glob, Grep, Write" },
    opencode: {
      mode: "subagent",
      tools: { write: true, edit: false, bash: false },
      permission: { edit: "deny", bash: { "*": "deny" } },
    },
  },
  plan: {
    template: "agents/plan.md",
    description:
      'Create structured implementation plans with scope, phases, and risks. Use when user wants to plan a feature, architect a solution, design an approach, or says "let\'s plan", "create a plan", "how should we build this", or needs to break down work into steps.',
    modelType: "smart",
    opencode: {
      mode: "primary",
      permission: { write: "allow", edit: "allow" },
    },
  },
  build: {
    template: "skills/execution.md",
    description:
      "Implement approved plans into production-ready code. Overrides OpenCode's built-in build agent with structured execution workflow including audit gates.",
    modelType: "smart",
    opencode: { mode: "primary" },
  },
  "quick-edits": {
    template: "agents/quick-edits.md",
    description:
      "Fast, focused editing for simple changes. Use for quick fixes, small refactors, and straightforward edits that don't need full planning or audit cycles.",
    modelType: "fast",
    opencode: { mode: "primary" },
  },
  "frontend-design": {
    template: "agents/frontend-design.md",
    description:
      "UI/UX focused editing for visual changes only. Use for styling, layout, animations, typography, and design system work. No logic changes. Supports ULTRATHINK trigger for deep design analysis.",
    modelType: "smart",
    opencode: { mode: "primary" },
  },
  manager: {
    template: "agents/manager.md",
    description:
      "Orchestrates full feature delivery with team of sub-agents. Manages workshop, planning (3 parallel planners), execution (domain-based executors), auditing (code + quality), reflection, and auto-fix loops. Use for complex features requiring coordinated multi-agent work.",
    modelType: "smart",
    claudeCode: { tools: "Read, Glob, Grep, Write, Task, Bash" },
    opencode: { mode: "primary" },
  },
  planner: {
    template: "agents/planner.md",
    description:
      "Independent planning sub-agent. Analyzes feature request and proposes implementation approach. Reports findings to manager (no file output). One of 3 parallel planners whose insights are synthesized into final plan.",
    modelType: "fast",
    claudeCode: { tools: "Read, Glob, Grep" },
    opencode: {
      mode: "subagent",
      tools: { write: false, edit: false, bash: false },
    },
  },
  executor: {
    template: "agents/executor.md",
    description:
      "Domain-focused implementation sub-agent. Executes specific portion of plan (frontend, backend, infra, etc.) as assigned by manager. Smart model for complex implementation decisions.",
    modelType: "smart",
    claudeCode: { tools: "Read, Glob, Grep, Write, Edit, Bash" },
    opencode: { mode: "subagent" },
  },
  "code-auditor": {
    template: "agents/code-auditor.md",
    description:
      "Verifies code works correctly. Checks tests pass, no runtime errors, type errors, linting issues, broken imports. Fast model for quick verification. Reports issues to manager.",
    modelType: "fast",
    claudeCode: { tools: "Read, Glob, Grep, Bash" },
    opencode: {
      mode: "subagent",
      tools: { write: false, edit: false },
    },
  },
  "quality-auditor": {
    template: "agents/quality-auditor.md",
    description:
      "Reviews code quality and standards. Checks patterns, naming, structure, maintainability, best practices. Fast model for pattern matching. Reports issues to manager.",
    modelType: "fast",
    claudeCode: { tools: "Read, Glob, Grep" },
    opencode: {
      mode: "subagent",
      tools: { write: false, edit: false, bash: false },
    },
  },
  reflector: {
    template: "agents/reflector.md",
    description:
      "Creates functional reflection on completed work. Summarizes what was built, what's complete, gaps identified, future improvements. Runs parallel with auditors. Smart model for comprehensive analysis.",
    modelType: "smart",
    claudeCode: { tools: "Read, Glob, Grep, Write" },
    opencode: {
      mode: "subagent",
      tools: { edit: false, bash: false },
    },
  },
  fixer: {
    template: "agents/fixer.md",
    description:
      "Fixes issues reported by auditors. Receives specific errors from manager, applies targeted fixes, updates state. Smart model for complex fixes. Max 2 fix attempts before escalation.",
    modelType: "smart",
    claudeCode: { tools: "Read, Glob, Grep, Write, Edit, Bash" },
    opencode: { mode: "subagent" },
  },
};

// =============================================================================
// Skill Configuration
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
  "user-story-review":
    "Review user stories from a developer perspective. Use when user wants to review user stories, check story quality, or says 'review this story', 'is this story clear', 'story feedback', or has user stories that need developer review before implementation.",
  "full-feature":
    "Manage full feature lifecycle from exploration to delivery. Use when building new features, implementing complete functionality, or when user mentions 'feature mode', 'full feature', or wants to go through Workshop, Plan, Execute, and Reflection phases systematically.",
  "frontend-design":
    "UI/UX focused editing for visual changes only. Use for styling, layout, animations, typography, and design system work. No logic changes. Supports ULTRATHINK trigger for deep design analysis.",
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

// =============================================================================
// Generators
// =============================================================================

async function generateSkills(): Promise<number> {
  console.log("  Generating skills...");

  const claudeDir = join(OUTPUT_DIR, "claude-code", "skills");
  const opencodeDir = join(OUTPUT_DIR, "opencode", "skills");
  const skillsDir = join(TEMPLATES_DIR, "skills");
  const files = await readdir(skillsDir);
  let count = 0;

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const name = basename(file, ".md");
    const template = await readFile(join(skillsDir, file), "utf-8");
    const description = SKILL_DESCRIPTIONS[name] || `${name} skill`;

    const content = `---
name: ${name}
description: ${description}
---

${template}`;

    // Write to both Claude Code and OpenCode (same format)
    for (const dir of [claudeDir, opencodeDir]) {
      const skillDir = join(dir, name);
      await ensureDir(skillDir);
      await writeFile(join(skillDir, "SKILL.md"), content);
    }
    count++;
  }

  // Copy full-feature templates subdirectory
  const fullFeatureTemplates = join(skillsDir, "full-feature", "templates");
  if (existsSync(fullFeatureTemplates)) {
    for (const dir of [claudeDir, opencodeDir]) {
      const destDir = join(dir, "full-feature", "templates");
      await ensureDir(destDir);
      await cp(fullFeatureTemplates, destDir, { recursive: true });
    }
  }

  console.log(`    Generated ${count} skills (Claude Code + OpenCode)`);
  return count;
}

async function generateWorkflows(): Promise<number> {
  console.log("  Generating Windsurf workflows...");

  const outputDir = join(OUTPUT_DIR, "windsurf", "workflows");
  const skillsDir = join(TEMPLATES_DIR, "skills");
  const files = await readdir(skillsDir);
  let count = 0;

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const name = basename(file, ".md");
    const workflowName = WORKFLOW_NAME_MAP[name] || `${name}-mode`;
    const template = await readFile(join(skillsDir, file), "utf-8");
    const description = SKILL_DESCRIPTIONS[name] || `${name} skill`;

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

async function generateAgents(): Promise<{ claude: number; opencode: number }> {
  console.log("  Generating agents...");

  const claudeDir = join(OUTPUT_DIR, "claude-code", "sub-agents");
  const opencodeDir = join(OUTPUT_DIR, "opencode", "agents");
  let claudeCount = 0;
  let opencodeCount = 0;

  for (const [name, config] of Object.entries(AGENT_CONFIGS)) {
    const templatePath = join(TEMPLATES_DIR, config.template);
    if (!existsSync(templatePath)) {
      console.warn(`    Warning: Template not found: ${config.template}`);
      continue;
    }

    const template = await readFile(templatePath, "utf-8");

    // Claude Code agent
    if (config.claudeCode) {
      const content = `---
name: ${name}
description: ${config.description}
tools: ${config.claudeCode.tools}
model: ${MODELS.claude[config.modelType]}
---

${template}`;
      await writeFile(join(claudeDir, `${name}.md`), content);
      claudeCount++;
    }

    // OpenCode agent
    if (config.opencode) {
      const frontmatter: Record<string, unknown> = {
        description: config.description,
        mode: config.opencode.mode,
        model: MODELS.opencode[config.modelType],
      };
      if (config.opencode.tools) frontmatter.tools = config.opencode.tools;
      if (config.opencode.permission)
        frontmatter.permission = config.opencode.permission;

      const content = `---
${toYaml(frontmatter)}
---

${template}`;
      await writeFile(join(opencodeDir, `${name}.md`), content);
      opencodeCount++;
    }
  }

  console.log(`    Generated ${claudeCount} Claude Code sub-agents`);
  console.log(`    Generated ${opencodeCount} OpenCode agents`);
  return { claude: claudeCount, opencode: opencodeCount };
}

async function generateConfigs(): Promise<void> {
  console.log("  Generating configs...");

  // MCP configs
  if (existsSync(MCP_FILE)) {
    const mcpServers = JSON.parse(await readFile(MCP_FILE, "utf-8"));

    // Claude Code: { mcpServers: { ... } }
    await writeFile(
      join(OUTPUT_DIR, "claude-code", "mcp.json"),
      JSON.stringify({ mcpServers }, null, 2)
    );

    // OpenCode: { name: { type: "local", command: [...] } }
    const opencodeMcp: Record<string, unknown> = {};
    for (const [name, server] of Object.entries(mcpServers)) {
      const s = server as { command: string; args: string[] };
      opencodeMcp[name] = { type: "local", command: [s.command, ...s.args] };
    }
    await writeFile(
      join(OUTPUT_DIR, "opencode", "mcp.json"),
      JSON.stringify(opencodeMcp, null, 2)
    );

    console.log("    Generated MCP configs");
  }

  // OpenCode config with model settings and built-in agent overrides
  const opencodeConfig = {
    model: MODELS.opencode.smart,
    small_model: MODELS.opencode.fast,
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
    agent: {
      explore: { model: MODELS.opencode.fast },
      general: { model: MODELS.opencode.smart },
    },
  };
  await writeFile(
    join(OUTPUT_DIR, "opencode", "opencode.json"),
    JSON.stringify(opencodeConfig, null, 2)
  );
  console.log("    Generated opencode.json");
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const clean = process.argv.includes("--clean") || process.argv.includes("-c");

  console.log("\nGenerating integration files from templates...\n");

  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`ERROR: Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  if (clean && existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true });
  }

  // Create output structure
  const dirs = [
    "claude-code/skills",
    "claude-code/sub-agents",
    "opencode/skills",
    "opencode/agents",
    "windsurf/workflows",
  ];
  for (const dir of dirs) {
    await ensureDir(join(OUTPUT_DIR, dir));
  }

  // Generate
  const skillCount = await generateSkills();
  const workflowCount = await generateWorkflows();
  const agentCounts = await generateAgents();
  await generateConfigs();

  console.log("\nGeneration complete!");
  console.log(`Output: ${OUTPUT_DIR}/\n`);
  console.log("Summary:");
  console.log(`  Claude Code: ${skillCount} skills, ${agentCounts.claude} sub-agents`);
  console.log(`  OpenCode: ${skillCount} skills, ${agentCounts.opencode} agents`);
  console.log(`  Windsurf: ${workflowCount} workflows`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
