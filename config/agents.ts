/**
 * Agent configurations for OpenCode
 * Defines which instructions are agents and their types
 */

import { type ModelType } from "./models";
import { AUDITORS } from "./auditors";

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
  // PRIMARY AGENTS (override built-in)
  // ============================================

  plan: {
    instruction: "plan",
    description:
      "Architect mode. Analyzes codebase, designs approach, creates executable plans. No code changes.",
    model: "smart",
    type: "primary",
    color: "#A855F7",
  },

  build: {
    instruction: "execution",
    description:
      "Execute mode. Implements plans into production-ready code following existing patterns.",
    model: "smart",
    type: "primary",
    color: "#EF4444",
  },

  workshop: {
    instruction: "workshop",
    description:
      "Thinking partner for brainstorming. Stress-tests ideas, pokes holes, stays critical.",
    model: "smart",
    type: "primary",
    color: "#3B82F6",
  },

  // ============================================
  // AUDITORS (from auditors.ts)
  // ============================================

  ...AUDITORS,
};
