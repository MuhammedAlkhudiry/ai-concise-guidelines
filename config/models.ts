/**
 * Model definitions for OpenCode
 * Single source of truth for all model names
 */

export const MODELS = {
  smart: "anthropic/claude-sonnet-4",
  fast: "anthropic/claude-haiku-4",
} as const;

export type ModelType = "smart" | "fast";
