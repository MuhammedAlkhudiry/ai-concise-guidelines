/**
 * Model definitions for OpenCode
 * Single source of truth for all model names
 */

export const MODELS = {
  smart: "anthropic/claude-opus-4-5",
  fast: "anthropic/claude-haiku-4-5",
} as const;

export type ModelType = "smart" | "fast";
