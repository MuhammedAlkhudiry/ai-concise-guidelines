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
}

export const AGENTS: Record<string, AgentConfig> = {
  // ============================================
  // PRIMARY AGENTS (user-invokable via Tab)
  // ============================================
  
  coordinator: {
    instruction: "coordinator",
    description: "Multi-model orchestrator. Spawns ensemble subagents, judges proposals, routes execution.",
    model: "coordinator",
    type: "primary",
    color: "#EF4444",
  },
  plan: {
    instruction: "plan",
    description: "Architect blueprints before building. Creates structured implementation plans.",
    model: "smart",
    type: "primary",
  },
  build: {
    instruction: "execution",
    description: "Implement approved plans into production-ready code.",
    model: "smart",
    type: "primary",
  },
  "frontend-design": {
    instruction: "frontend-design",
    description: "UI/UX focused editing for visual changes only.",
    model: "smart",
    type: "primary",
    color: "#A855F7",
  },
  "quick-edits": {
    instruction: "quick-edits",
    description: "Fast, focused edits without heavy process overhead.",
    model: "fast",
    type: "primary",
    color: "#EAB308",
  },
  workshop: {
    instruction: "workshop",
    description: "Thinking partner for brainstorming. Stress-tests ideas, pokes holes, stays critical.",
    model: "smart",
    type: "primary",
    color: "#F97316",
  },

  // ============================================
  // SUBAGENTS (spawned by coordinator/other agents)
  // ============================================
  
  // Single-model subagents
  auditor: {
    instruction: "auditor",
    description: "Audits code changes for correctness, quality, and completeness.",
    model: "smart",
    type: "sub",
  },

  // Ensemble: Workshoppers (same instruction, different models)
  "workshopper-1": {
    instruction: "workshop",
    description: "Workshop proposer (ensemble slot 1)",
    model: "ensemble_1",
    type: "sub",
  },
  "workshopper-2": {
    instruction: "workshop",
    description: "Workshop proposer (ensemble slot 2)",
    model: "ensemble_2",
    type: "sub",
  },
  "workshopper-3": {
    instruction: "workshop",
    description: "Workshop proposer (ensemble slot 3)",
    model: "ensemble_3",
    type: "sub",
  },

  // Ensemble: Auditors/Reviewers (same instruction, different models)
  "auditor-1": {
    instruction: "auditor",
    description: "Code reviewer (ensemble slot 1)",
    model: "ensemble_1",
    type: "sub",
  },
  "auditor-2": {
    instruction: "auditor",
    description: "Code reviewer (ensemble slot 2)",
    model: "ensemble_2",
    type: "sub",
  },
  "auditor-3": {
    instruction: "auditor",
    description: "Code reviewer (ensemble slot 3)",
    model: "ensemble_3",
    type: "sub",
  },

  // Executor (used by coordinator for execution phase)
  executor: {
    instruction: "execution",
    description: "Executes scoped implementation tasks",
    model: "executor",
    type: "sub",
  },
} as const;
