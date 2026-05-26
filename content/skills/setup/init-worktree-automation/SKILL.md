---
name: init-worktree-automation
description: Initialize or repair repo-local worktree automation when a repo lacks scripts/create-worktree.ts, the creation command is broken, or READY cannot be reached automatically.
---

# Init Worktree Automation

Create or repair the repo-owned automation that can produce a ready worktree.

## Workflow

1. Resolve the canonical checkout and intended repo root.
2. Inventory repo docs, manifests, `.env.example`, DDEV config, services, ignored deps, and checks:

```bash
rtk bun "$HOME/.agents/skills/init-worktree-automation/scripts/collect-worktree-context.ts" /path/to/repo
```

3. Read repo setup docs, manifests, DDEV config, `.env.example`, and `CHECKLIST.md`.
4. Create or update `scripts/create-worktree.ts`; it must create the branch/worktree, call readiness automation, support `--dry-run`, and print `READY` only after verification passes.
5. Create or update internal readiness helpers such as `scripts/setup-worktree.ts`; they must stay idempotent, support `--dry-run`, and print `BLOCKED` with exact blockers.
6. Use `references/worktree-repair-playbook.md` for DDEV lanes, dependency reuse, env/data reuse, Vite/assets, storage, search, mobile boundaries, and cleanup ownership.
7. Run the creation command against a disposable branch/path.
8. Patch automation and rerun until the disposable worktree reaches `READY`.
9. Clean up disposable branches, worktrees, processes, and owned local services.
10. Summarize the command, changed automation files, verification evidence, and cleanup.

## Rules

- Use only commands and URLs found in the repo or clearly implied by project config.
- Do not invent setup commands, secrets, production credentials, or build commands.
- Run Laravel/PHP commands inside DDEV unless explicitly told otherwise.
- For host JavaScript commands, use the package manager already used by the repo.
- Use explicit commands from repo docs and `CHECKLIST.md` over collector-guessed checks.
- Ready means required services, env, storage, search, seed data, Vite/assets, and app URL checks pass.
- Keep mobile out of the default web setup path unless explicitly asked for mobile readiness.
- Do not touch the main worktree while testing a disposable worktree unless explicitly asked.
