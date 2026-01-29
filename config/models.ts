/**
 * Model definitions for OpenCode and Claude Code
 * Single source of truth for all model names
 */

// OpenCode uses full model identifiers
export const MODELS = {
    // Primary models
    smart: "openai/gpt-5.2-codex",
    fast: "fireworks-ai/accounts/fireworks/models/kimi-k2p5",

    // Auditor model
    auditor: "openai/gpt-5.2-codex",

    // UI Review model (vision-capable, good with UI/UX)
    ui_reviewer: "openai/gpt-5.2-codex",
} as const;

// Claude Code uses short aliases
export const CLAUDE_CODE_MODELS: Record<keyof typeof MODELS, string> = {
    smart: "opus",
    fast: "haiku",
    auditor: "sonnet",
    ui_reviewer: "sonnet", // Claude Code doesn't support Gemini, fallback to Sonnet
} as const;

export type ModelType = keyof typeof MODELS;
