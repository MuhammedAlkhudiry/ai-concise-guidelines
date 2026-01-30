/**
 * Model definitions for OpenCode
 * Single source of truth for model names used in config generation
 */

export const MODELS = {
    smart: "anthropic/claude-opus-4-5",
    fast: "anthropic/claude-haiku-4-5",
} as const;

export type ModelType = keyof typeof MODELS;
