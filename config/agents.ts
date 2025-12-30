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
}

export const AGENTS: Record<string, AgentConfig> = {
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
  },
  "quick-edits": {
    instruction: "quick-edits",
    description: "Fast, focused edits without heavy process overhead.",
    model: "fast",
    type: "primary",
  },
  auditor: {
    instruction: "auditor",
    description: "Audits code changes for correctness, quality, and completeness.",
    model: "smart",
    type: "sub",
  },
} as const;

/** Get all primary agents (user-invokable modes) */
export const getPrimaryAgents = () =>
  Object.entries(AGENTS).filter(([_, config]) => config.type === "primary");

/** Get all sub-agents (spawned by other agents) */
export const getSubAgents = () =>
  Object.entries(AGENTS).filter(([_, config]) => config.type === "sub");
