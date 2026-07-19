/**
 * Codex config values managed by my-setup.
 */

export const CODEX_CONFIG = {
  model_verbosity: "low",
  agents: {
    max_threads: 15,
  },
  features: {
    default_mode_request_user_input: true,
  },
} as const;
