/**
 * Skill configurations for OpenCode
 * Defines which instructions are skills and their trigger descriptions
 */

export interface SkillConfig {
  /** Instruction file name (without .md) */
  instruction: string;
  /** Skill trigger description (when to use this skill) */
  description: string;
}

export const SKILLS: Record<string, SkillConfig> = {
  // ============================================
  // WORKFLOW SKILLS
  // ============================================

  planning: {
    instruction: "plan",
    description:
      "Create structured implementation plans with phases and assumptions. Use when user wants to plan a feature, architect a solution, design an approach, or says 'let's plan', 'create a plan', 'how should we build this', or needs to break down work into steps.",
  },
  execution: {
    instruction: "execution",
    description:
      "Implement approved plans into production-ready code. Use when user wants to build, implement, code, or execute an approved plan. Activates when user says 'let's build', 'implement this', 'start coding', or 'execute the plan'.",
  },
  workshop: {
    instruction: "workshop",
    description:
      "Explore and stress-test ideas before building. Use when user wants to brainstorm, think through an approach, explore options, discuss trade-offs, or says 'let's workshop this', 'think through', 'explore idea', or 'brainstorm'.",
  },
  refactoring: {
    instruction: "refactoring",
    description:
      "Restructure code without changing behavior. Use when user wants to refactor, clean up code, restructure, or says 'refactor this', 'clean this up', 'this code is messy', or identifies code smells to fix.",
  },

  // ============================================
  // CODING STANDARDS SKILLS
  // ============================================

  typescript: {
    instruction: "typescript",
    description:
      "TypeScript/JavaScript coding standards. Use when working on TS/JS code to ensure type safety, proper async handling, and clean code style.",
  },
  react: {
    instruction: "react",
    description:
      "React coding standards. Use when working on React components to ensure proper hooks usage, state management, and performance patterns.",
  },
  laravel: {
    instruction: "laravel",
    description:
      "Laravel/PHP coding standards. Use when working on Laravel backend to ensure proper architecture, Eloquent usage, and PHP type safety.",
  },

  // ============================================
  // UI/UX SKILLS
  // ============================================

  "uxui-design": {
    instruction: "uxui-design",
    description:
      "Practical UI/UX work within existing design systems. Use for styling, layout, states, accessibility, and design system compliance. Use when working on established products.",
  },
  "uxui-creative": {
    instruction: "uxui-creative",
    description:
      "Distinctive, bold UI design that avoids generic AI aesthetics. Use for landing pages, new products, marketing sites, or when user wants something that stands out. Covers typography, themes, animations, and anti-patterns.",
  },

  // ============================================
  // PRODUCT & RESEARCH SKILLS
  // ============================================

  "product-strategy": {
    instruction: "product-strategy",
    description:
      "Find 10x product opportunities and high-leverage improvements. Use when user wants strategic product thinking, mentions '10x', wants to find high-impact features, or says 'what would make this 10x better', 'product strategy', or 'what should we build next'.",
  },
  "feature-research": {
    instruction: "feature-research",
    description:
      "Deep research on features before building with co-founder mindset. Use when user wants to research a feature idea, explore if something is worth building, or says 'research this feature', 'is this worth building', 'explore this idea', or wants product + market + tech analysis.",
  },

  // ============================================
  // REVIEW & QA SKILLS
  // ============================================

  "api-handoff": {
    instruction: "api-handoff",
    description:
      "Create API handoff documentation for frontend developers. Use when backend work is complete and needs to be documented for frontend integration, or user says 'create handoff', 'document API', 'frontend handoff', or 'API documentation'.",
  },
  "user-story-review": {
    instruction: "user-story-review",
    description:
      "Review user stories from a developer perspective. Use when user wants to review user stories, check story quality, or says 'review this story', 'is this story clear', 'story feedback', or has user stories that need developer review before implementation.",
  },
  translation: {
    instruction: "translation",
    description:
      "Review translations for quality, naturalness, and cultural fit. Use when user wants to review translations, check i18n files, or says 'review translations', 'check localization', or mentions translation quality issues.",
  },
  "qa-test-cases": {
    instruction: "qa-test-cases",
    description:
      "Generate test cases for user flows and e2e testing. Use when user wants test cases, QA scenarios, or says 'generate test cases', 'write test cases', 'QA this feature', 'e2e tests', or needs comprehensive test coverage for a feature.",
  },

  // ============================================
  // AUDIT SKILLS
  // ============================================

  "audit-orchestrator": {
    instruction: "auditing/audit-orchestrator",
    description:
      "Run comprehensive audit on completed work. Use ONLY when user explicitly asks - says 'audit this', 'review the work', 'check for issues'. Never trigger automatically after implementation. Spawns specialized auditor sub-agents and fixes found issues.",
  },
  "auditor-test-coverage": {
    instruction: "auditing/auditor-test-coverage",
    description:
      "Audit test coverage, missing cases, and edge cases. Typically loaded by the audit-orchestrator skill via sub-agents, but can be used standalone.",
  },
  "auditor-integration": {
    instruction: "auditing/auditor-integration",
    description:
      "Audit backend-frontend integration and API contracts. Typically loaded by the audit-orchestrator skill via sub-agents, but can be used standalone.",
  },
  "auditor-backend": {
    instruction: "auditing/auditor-backend",
    description:
      "Audit backend code quality, performance, database, and security. Typically loaded by the audit-orchestrator skill via sub-agents, but can be used standalone.",
  },
  "auditor-frontend-ui-ux": {
    instruction: "auditing/auditor-frontend-ui-ux",
    description:
      "Audit frontend code quality, UI/UX, forms, state management, and translations. Typically loaded by the audit-orchestrator skill via sub-agents, but can be used standalone.",
  },

  // ============================================
  // CONVERTED COMMANDS (formerly /commands)
  // ============================================

  "init-knowledge": {
    instruction: "init-knowledge",
    description:
      "Initialize or update KNOWLEDGE.md with project business context. Use when user says 'init knowledge', 'create knowledge file', 'update knowledge', or wants to capture project context for AI.",
  },
  "init-prd": {
    instruction: "init-prd",
    description:
      "Initialize or update PRD.md product roadmap through structured questioning. Use when user says 'init prd', 'create roadmap', 'define features', 'product roadmap', 'what are we building', or wants to capture product vision and feature initiatives.",
  },
  "check-and-fix": {
    instruction: "check-and-fix",
    description:
      "Run all checks (typecheck, lint, format, tests) and fix any failures. Use when user says 'check and fix', 'run checks', 'lint and fix', or wants to verify code quality.",
  },
  "git-branch-mr": {
    instruction: "git-branch-mr",
    description:
      "Git branch and merge request workflow. Use when user says 'create branch', 'create MR', 'push and create PR', or wants to go through the git branch workflow.",
  },
  "monorepo-makefile": {
    instruction: "monorepo-makefile",
    description:
      "Set up a root Makefile that forwards commands to monorepo subprojects. Use when user says 'run from root', 'makefile forwarding', 'monorepo commands', or wants to avoid cd-ing into subdirectories to run commands.",
  },
  "cloudflare-tunnel": {
    instruction: "cloudflare-tunnel",
    description:
      "Set up Cloudflare Tunnel for stable, free public HTTPS URL to local dev server. Use when user says 'setup tunnel', 'expose local', 'cloudflare tunnel', 'public URL', or wants to share local dev environment externally.",
  },
} as const;
