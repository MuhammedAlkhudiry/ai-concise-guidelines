---
name: git-operations
description: Use before running two or more git commands for status snapshots, diff review, branch sync, worktree cleanup, targeted restore, or history search. Use raw `rtk git` only for one simple command.
---

# Git Operations

Use scripts when a git task needs more than one command for information or action.

## Workflow

Run the matching helper instead of repeating multi-command git sequences:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-snapshot.ts"
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-review.ts" -- path/or/folder
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-branch-sync.ts" --base=origin/main
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-branch-clean.ts" --base=origin/main
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-worktree-clean.ts"
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-restore-preview.ts" --base=main -- path/or/file
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-history-find.ts" query-or-path
```

## Rules

- Use raw `rtk git` directly for a single simple read like `rtk git status --short`.
- Use these scripts for repeated status, diff, branch, worktree, restore, or history flows.
- Use `git-branch-sync.ts --merge` only when the user asked to sync or merge.
- Use `git-branch-clean.ts --delete-merged` only after previewing which local branches are merged into the base.
- Use `git-branch-clean.ts --prune-remotes` only when remote-tracking cleanup is part of the request.
- Use `git-worktree-clean.ts --remove-clean` only for clean secondary worktrees.
- Use `git-worktree-clean.ts --force-dirty` only after explicit approval.
- Use `git-restore-preview.ts --apply` only after the restore target is clear.
- Keep destructive actions opt-in. Preview before restore, merge, branch deletion, or worktree removal.
- Do not force-remove dirty worktrees without explicit user approval.
- Use `git-branch-mr` / `gbr` for final branch, commit, push, and PR packaging.
