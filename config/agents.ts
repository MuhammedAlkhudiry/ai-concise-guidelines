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
  // PRIMARY AGENTS
  // ============================================

  workshop: {
    instruction: "workshop",
    description: "Thinking partner for brainstorming. Stress-tests ideas, pokes holes, stays critical.",
    model: "smart",
    type: "primary",
    color: "#F97316",
  },

  // ============================================
  // AUDITORS (from auditors.ts)
  // ============================================

  ...AUDITORS,
};
