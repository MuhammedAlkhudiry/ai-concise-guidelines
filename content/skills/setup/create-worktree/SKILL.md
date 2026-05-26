---
name: create-worktree
description: Run initialized repo-local worktree creation. Use when asked to create, start, prepare, or run a fresh worktree in a repo that has scripts/create-worktree.ts.
---

# Create Worktree

Run the repo-owned creation command and accept only its `READY` or `BLOCKED` result.

## Workflow

1. Resolve the repo root and requested branch or task name.
2. Confirm `scripts/create-worktree.ts` exists.
3. Run the repo command from the canonical checkout:

```bash
rtk bun scripts/create-worktree.ts <branch-or-task>
```

4. If the command prints `READY`, report the worktree path, branch, URL, and fixture details printed by the command.
5. If the command is missing or prints `BLOCKED`, stop and say the repo needs `init-worktree-automation`.

## Rules

- Do not manually run `git worktree add`, `ddev start`, dependency installs, migrations, seeders, Vite, env edits, or readiness repair.
- Do not recreate the setup steps from the command output.
- Do not edit `scripts/create-worktree.ts` or readiness helpers.
- Do not touch the main worktree after the created worktree path exists unless explicitly asked.
- Delegate branch sync, diff review, targeted restore, file history, commit, push, and PR packaging to the relevant git skill.
