/**
 * Model definitions for OpenCode
 * Single source of truth for all model names
 */

export const MODELS = {
  // Primary models
  smart: "anthropic/claude-opus-4-5",
  fast: "anthropic/claude-haiku-4-5",

  // UI Review model (vision-capable, good with UI/UX)
  ui_reviewer: "google/gemini-3-pro-preview",
} as const;

export type ModelType = keyof typeof MODELS;
