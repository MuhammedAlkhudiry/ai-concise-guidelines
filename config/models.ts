/**
 * Model definitions for OpenCode
 * Single source of truth for all model names
 */

export const MODELS = {
  // Primary models
  smart: "openai/gpt-5.2",
  fast: "anthropic/claude-haiku-4-5",

  // Auditor model
  auditor: "openai/gpt-5.2",

  // UI Review model (vision-capable, good with UI/UX)
  ui_reviewer: "openai/gpt-5.2",
} as const;

export type ModelType = keyof typeof MODELS;
