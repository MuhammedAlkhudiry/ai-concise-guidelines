/**
 * Model definitions for OpenCode and Claude Code
 * Single source of truth for all model names
 */

// OpenCode uses full model identifiers
export const MODELS = {
    // Primary models
    smart: "openai/gpt-5.2",
    fast: "anthropic/claude-haiku-4-5",

    // Auditor model
    auditor: "anthropic/claude-opus-4-5",

    // UI Review model (vision-capable, good with UI/UX)
    ui_reviewer: "openai/gpt-5.2",
} as const;

// Claude Code uses short aliases
export const CLAUDE_CODE_MODELS: Record<keyof typeof MODELS, string> = {
    smart: "opus",
    fast: "haiku",
    auditor: "sonnet",
    ui_reviewer: "sonnet", // Claude Code doesn't support Gemini, fallback to Sonnet
} as const;

export type ModelType = keyof typeof MODELS;
