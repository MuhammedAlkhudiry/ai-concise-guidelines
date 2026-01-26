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
  /** Additional model/provider options (passed through) */
  additional?: Record<string, unknown>;
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
    // Higher temperature for creative thinking and varied perspectives
    additional: { temperature: 1 },
  },

  // ============================================
  // CREATIVE SUBAGENTS (higher temperature)
  // ============================================

  "uxui-creative": {
    instruction: "uxui-creative",
    description:
      "Distinctive, bold UI design that avoids generic AI aesthetics. For landing pages, new products, marketing sites.",
    model: "smart",
    type: "sub",
    // High temperature for creative, distinctive design choices
    additional: { temperature: 1 },
  },

  "product-strategy": {
    instruction: "product-strategy",
    description:
      "Find 10x product opportunities. Strategic thinking, high-impact features, no safe ideas.",
    model: "smart",
    type: "sub",
    // Higher temperature for bold, creative strategic thinking
    additional: { temperature: 1 },
  },

  "feature-research": {
    instruction: "feature-research",
    description:
      "Deep research on features with co-founder mindset. Explores options, challenges assumptions.",
    model: "smart",
    type: "sub",
    // Moderate-high temperature for exploratory thinking
    additional: { temperature: 0.8 },
  },

  translation: {
    instruction: "translation",
    description:
      "Review translations for quality, naturalness, and cultural fit. Natural language output.",
    model: "smart",
    type: "sub",
    // Moderate temperature for natural, varied language
    additional: { temperature: 0.5 },
  },

  // ============================================
  // AUDITORS (from auditors.ts)
  // ============================================

  ...AUDITORS,
};
