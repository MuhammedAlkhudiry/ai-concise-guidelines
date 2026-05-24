---
name: git-operations
description: Use for multi-step git diagnostics or actions such as reviewing diffs, summarizing status, syncing branches, cleaning worktrees, targeted restore from a base branch, or recovering file history. Use raw `rtk git` only for one simple command.
---

# Git Operations

Use scripts when a git task needs more than one command for information or action.

## Workflow

Run the matching helper instead of repeating multi-command git sequences:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-snapshot.ts"
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-review.ts" -- path/or/folder
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-branch-sync.ts" --base=origin/main
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-worktree-clean.ts"
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-restore-preview.ts" --base=main -- path/or/file
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-history-find.ts" query-or-path
```

## Rules

- Use raw `rtk git` directly for a single simple read like `rtk git status --short`.
- Use these scripts for repeated status, diff, branch, worktree, restore, or history flows.
- Use `git-branch-sync.ts --merge` only when the user asked to sync or merge.
- Use `git-worktree-clean.ts --remove-clean` only for clean secondary worktrees.
- Use `git-worktree-clean.ts --force-dirty` only after explicit approval.
- Use `git-restore-preview.ts --apply` only after the restore target is clear.
- Keep destructive actions opt-in. Preview before restore, merge, or worktree removal.
- Do not force-remove dirty worktrees without explicit user approval.
- Use `git-branch-mr` / `gbr` for final branch, commit, push, and PR packaging.
