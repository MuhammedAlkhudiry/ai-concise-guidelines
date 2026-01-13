/**
 * Agent configurations for OpenCode
 * Defines which instructions are agents and their types
 */

import { type ModelType } from "./models";

export interface AgentConfig {
  /** Instruction file name (without .md) */
  instruction: string;
  /** Agent description */
  description: string;
  /** Model type to use */
  model: ModelType;
  /** Agent type: primary (user-invokable mode) or sub (spawned by other agents) */
  type: "primary" | "sub";
  /** Hex color code for the agent (e.g., #FF5733) */
  color?: string;
  /** Checklist file to merge (for specialized auditors) */
  checklist?: string;
}

export const AGENTS: Record<string, AgentConfig> = {
  // ============================================
  // PRIMARY AGENTS (user-invokable via Tab)
  // ============================================
  
  workshop: {
    instruction: "workshop",
    description: "Thinking partner for brainstorming. Stress-tests ideas, pokes holes, stays critical.",
    model: "smart",
    type: "primary",
    color: "#F97316",
  },
  audit: {
    instruction: "audit",
    description: "Orchestrates specialized auditors to review completed features/changes.",
    model: "smart",
    type: "primary",
    color: "#10B981",
  },

  // ============================================
  // SUBAGENTS (spawned by other agents)
  // ============================================
  
  // ============================================
  // SPECIALIZED AUDITORS
  // ============================================
  
  // Core auditors (always run)
  "auditor-code-quality": {
    instruction: "auditor",
    description: "Audits code standards, patterns, clean code",
    model: "smart",
    type: "sub",
    checklist: "code-quality",
  },
  "auditor-tooling": {
    instruction: "auditor-tooling",
    description: "Runs and verifies type checks, lint, tests, build",
    model: "smart",
    type: "sub",
    // No checklist - tooling auditor runs commands, not reviews
  },
  "auditor-test-coverage": {
    instruction: "auditor",
    description: "Audits test coverage, missing cases, edge cases",
    model: "smart",
    type: "sub",
    checklist: "test-coverage",
  },
  "auditor-refactoring": {
    instruction: "auditor",
    description: "Identifies tech debt, duplication, refactoring opportunities",
    model: "smart",
    type: "sub",
    checklist: "refactoring",
  },
  "auditor-cleanup": {
    instruction: "auditor",
    description: "Audits for dead code, debug artifacts, unused imports, leftover TODOs",
    model: "smart",
    type: "sub",
    checklist: "cleanup",
  },

  // Conditional auditors (based on change type)
  "auditor-ui": {
    instruction: "auditor",
    description: "Audits UI/UX quality, visual consistency, usability",
    model: "ui_reviewer",
    type: "sub",
    checklist: "ui-ux",
  },
  "auditor-integration": {
    instruction: "auditor",
    description: "Audits backend↔frontend integration, API contracts",
    model: "smart",
    type: "sub",
    checklist: "integration",
  },
  "auditor-security": {
    instruction: "auditor",
    description: "Audits security vulnerabilities, injection, auth flaws",
    model: "smart",
    type: "sub",
    checklist: "security",
  },
  "auditor-performance": {
    instruction: "auditor",
    description: "Audits performance issues, N+1 queries, memory leaks",
    model: "smart",
    type: "sub",
    checklist: "performance",
  },
  "auditor-database": {
    instruction: "auditor",
    description: "Audits migrations, schema, indexes, data integrity",
    model: "smart",
    type: "sub",
    checklist: "database",
  },
  "auditor-translation": {
    instruction: "auditor",
    description: "Audits translations, i18n completeness, text quality",
    model: "smart",
    type: "sub",
    checklist: "translation",
  },

} as const;
