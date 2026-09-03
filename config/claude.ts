import { createClaudePermissionAllowList } from "./permissions";

/**
 * Claude Code settings managed by my-setup. Only the keys returned here are overwritten in
 * `~/.claude/settings.json`; every other key stays user-owned.
 */
export function createClaudeManagedSettings(): { permissions: { allow: string[] } } {
  return { permissions: { allow: createClaudePermissionAllowList() } };
}

// Legacy unmanaged Claude Code files that the installer removes so stale prompts stop loading.
export const CLAUDE_LEGACY_DIRECTORIES = [".claude/commands", ".claude/agents"] as const;
