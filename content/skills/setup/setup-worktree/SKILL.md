---
name: setup-worktree
description: Run initialized repo-local setup for an existing git worktree. Use before any coding, verification, QA, or product task in a worktree path that has scripts/setup-worktree.ts, even when the user did not mention setup.
---

# Setup Worktree

Run the repo-owned setup command once, then treat setup as closed.
`READY` means services, env, dependencies, data, storage/search, Vite, and app URLs are verified by the script.

## Workflow

1. Resolve the existing git worktree path and enter it.
2. Confirm `scripts/setup-worktree.ts` exists.
3. Run the repo command from the worktree root:

```bash
rtk bun scripts/setup-worktree.ts "$PWD"
```

4. If the command prints `READY`, continue with product work.
5. If the command is missing, fails, or prints `WORKTREE_NOT_READY`, stop and report the blockers.

## Rules

- Do not create git worktrees, branches, or paths.
- Do not manually run DDEV setup, `.env` edits, dependency installs, migrations, seeders, Vite startup, storage setup, search setup, or readiness repair.
- Do not recreate setup steps from command output.
- Do not edit `scripts/setup-worktree.ts` or readiness helpers.
- After `READY`, do not run setup commands again. If readiness is missing later, stop with `WORKTREE_NOT_READY`.
- Delegate branch sync, diff review, targeted restore, file history, commit, push, and PR packaging to the relevant git skill.
