---
name: setup-worktree
description: Run initialized repo-local setup for an existing secondary git worktree only when no .codex/worktree-ready.json READY marker exists. Use before coding, verification, QA, or product work in a secondary worktree path with scripts/setup-worktree.ts; never use in the canonical checkout.
---

# Setup Worktree

Use the repo-owned readiness marker or setup command once for secondary worktrees, then treat setup as closed.
`READY` means services, env, dependencies, data, storage/search, Vite, and app URLs are verified by the script.

## Workflow

1. Resolve the existing git worktree path and enter it.
2. If the path is the canonical checkout, do not run setup; continue with normal repo instructions.
3. If `.codex/worktree-ready.json` reports `READY`, do not run setup; continue with product work.
4. Confirm `scripts/setup-worktree.ts` exists.
5. Run the repo command from the worktree root:

```bash
rtk bun scripts/setup-worktree.ts "$PWD"
```

6. If the command prints `READY`, continue with product work.
7. If the command is missing, fails, or prints `WORKTREE_NOT_READY`, stop and report the blockers.

## Rules

- Do not create git worktrees, branches, or paths.
- Running setup in the canonical checkout is failure.
- Running setup when `.codex/worktree-ready.json` reports `READY` is failure.
- Do not manually run DDEV setup, `.env` edits, dependency installs, migrations, seeders, Vite startup, storage setup, search setup, or readiness repair.
- Do not recreate setup steps from command output.
- Do not edit `scripts/setup-worktree.ts` or readiness helpers.
- After `READY`, do not run setup commands again. If readiness is missing later, stop with `WORKTREE_NOT_READY`.
- Delegate branch sync, diff review, targeted restore, file history, commit, push, and PR packaging to the relevant git skill.
