/**
 * Model definitions for OpenCode
 * Single source of truth for all model names
 */

export const MODELS = {
  // Primary models
  smart: "anthropic/claude-opus-4-5",
  fast: "anthropic/claude-haiku-4-5",

  // Coordinator model
  coordinator: "anthropic/claude-opus-4-5",

  // Ensemble models (configurable slots — change these to your preferred models)
  ensemble_1: "anthropic/claude-opus-4-5",
  ensemble_2: "google/gemini-3-pro",
  ensemble_3: "opencode/minimax-m2.1-free",

  // Executor model
  executor: "anthropic/claude-opus-4-5",
} as const;

export type ModelType = keyof typeof MODELS;
