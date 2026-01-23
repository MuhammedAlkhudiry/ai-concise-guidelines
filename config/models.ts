/**
 * Model definitions for OpenCode and Claude Code
 * Single source of truth for all model names
 */

// OpenCode uses full model identifiers
export const MODELS = {
  smart: "anthropic/claude-opus-4-5",
  fast: "anthropic/claude-haiku-4-5",
  ui_reviewer: "google/gemini-3-pro-preview",
} as const;

// Claude Code uses short aliases
export const CLAUDE_CODE_MODELS: Record<keyof typeof MODELS, string> = {
  smart: "opus",
  fast: "haiku",
  ui_reviewer: "sonnet", // Claude Code doesn't support Gemini, fallback to Sonnet
} as const;

export type ModelType = keyof typeof MODELS;
