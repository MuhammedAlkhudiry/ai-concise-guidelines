/**
 * Auditor configurations
 * All auditors are subagents using auditor model (except ui which needs vision)
 */

import { type AgentConfig } from "./agents";

// Just name → description. Config is derived.
const AUDITOR_DESCRIPTIONS: Record<string, string> = {
  // Core (always run)
  "code-quality": "Audits code standards, patterns, clean code",
  "tooling": "Runs and verifies type checks, lint, tests, build",
  "cleanup": "Audits for dead code, debug artifacts, unused imports, leftover TODOs",
  "performance": "Audits performance issues, N+1 queries, memory leaks",
  "naming": "Audits naming clarity, consistency, intent-revealing names",

  // Conditional
  "test-coverage": "Audits test coverage, missing cases, edge cases",
  "refactoring": "Identifies tech debt, duplication, refactoring opportunities",
  "ui": "Audits UI/UX quality, visual consistency, usability",
  "state": "Audits state management, data flow, re-renders, normalization",
  "forms": "Audits form validation, error display, submission, accessibility",
  "integration": "Audits backend↔frontend integration, API contracts",
  "database": "Audits migrations, schema, indexes, data integrity",
  "security": "Audits security vulnerabilities, injection, auth flaws",
  "translation": "Audits translations, i18n completeness, text quality",
};

const AUDITOR_ADDITIONAL: AgentConfig["additional"] = {
  reasoningEffort: "medium",
};

// Special model overrides (default is "fast")
const MODEL_OVERRIDES: Record<string, AgentConfig["model"]> = {
  "ui": "ui_reviewer", // needs vision
};

// Generate full auditor configs
export const AUDITORS: Record<string, AgentConfig> = Object.fromEntries(
  Object.entries(AUDITOR_DESCRIPTIONS).map(([name, description]) => [
    `auditor-${name}`,
    {
      instruction: `auditing/auditor-${name}`,
      description,
      model: MODEL_OVERRIDES[name] ?? "auditor",
      additional: AUDITOR_ADDITIONAL,
      type: "sub" as const,
    },
  ])
);
