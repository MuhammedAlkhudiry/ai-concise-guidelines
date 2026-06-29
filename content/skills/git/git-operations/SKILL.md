---
name: git-operations
description: Multi-command git work for snapshots, diff review, branch sync, worktree cleanup, targeted restore, and history search; use raw `rtk git` for simple reads.
---

# Git Operations

Use scripts for git tasks that need multi-step context or action.

## Workflow

Run the matching helper instead of repeating shell sequences:

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

- Use raw `rtk git` for one simple read such as `rtk git status --short`.
- Use helpers for repeated status, diff, branch, worktree, restore, or history flows.
- Use `git-branch-sync.ts --merge` only when the user asked to sync or merge.
- Use `git-branch-clean.ts --delete-merged` only after previewing which local branches are merged into the base.
- Use `git-branch-clean.ts --prune-remotes` only when remote-tracking cleanup is part of the request.
- Use `git-worktree-clean.ts --remove-clean` only for clean secondary worktrees.
- Use `git-worktree-clean.ts --force-dirty` only after explicit approval.
- Use `git-restore-preview.ts --apply` only after the restore target is clear.
- Preview before restore, merge, branch deletion, or worktree removal.
- Use `git-branch-mr` for final branch, commit, push, and PR packaging.
