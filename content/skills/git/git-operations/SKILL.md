---
name: git-operations
description: Use for multi-step git diagnostics or actions such as reviewing diffs, summarizing status, syncing branches, cleaning worktrees, targeted restore from a base branch, or recovering file history. Use raw `rtk git` only for one simple command.
---

# Git Operations

Use scripts when a git task needs more than one command for information or action.

## Workflow

1. For current state, run:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-snapshot.ts"
```

2. For diff review, run:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-review.ts" -- path/or/folder
```

3. For branch sync checks, run:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-branch-sync.ts" --base=origin/main
```

Use `--merge` only when the user asked to sync/merge.

4. For worktree cleanup, run:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-worktree-clean.ts"
```

Use `--remove-clean` to remove clean secondary worktrees. Use `--force-dirty` only after explicit approval.

5. For targeted restore from a base branch, preview first:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-restore-preview.ts" --base=main -- path/or/file
```

Use `--apply` only after the restore target is clear.

6. For old file/history recovery, run:

```bash
rtk bun "$HOME/.agents/skills/git-operations/scripts/git-history-find.ts" query-or-path
```

## Rules

- Use raw `rtk git` directly for a single simple read like `rtk git status --short`.
- Use these scripts for repeated status, diff, branch, worktree, restore, or history flows.
- Keep destructive actions opt-in. Preview before restore, merge, or worktree removal.
- Do not force-remove dirty worktrees without explicit user approval.
- Use `git-branch-mr` / `gbr` for final branch, commit, push, and PR packaging.
