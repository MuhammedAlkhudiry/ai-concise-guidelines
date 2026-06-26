---
name: init-worktree-automation
description: Codex worktree automation setup or repair for missing scripts/setup-worktree.ts, scripts/cleanup-worktree.ts, automatic readiness, local environment actions, or broken local-environment setup.
---

# Init Worktree Automation

Create or repair repo-owned setup and cleanup automation for Codex-created worktrees.

## Workflow

1. Resolve the canonical checkout and a disposable test worktree.
2. Inventory docs, manifests, `.env.example`, DDEV config, services, ignored deps, and checks:

```bash
rtk bun "$HOME/.agents/skills/init-worktree-automation/scripts/collect-worktree-context.ts" /path/to/repo
```

3. Read repo setup docs, manifests, DDEV config, `.env.example`, and `CHECKLIST.md`.
4. Create or update `scripts/setup-worktree.ts`: accept the worktree, use Codex path env vars, stay idempotent, support `--dry-run`, print `READY` only after verification passes, and print `WORKTREE_NOT_READY` with exact blockers.
5. Create or update `scripts/cleanup-worktree.ts`: remove only worktree-owned resources and leave Git worktree removal to Codex.
6. Create or update `.codex/environments/environment.toml` so Codex-created worktrees run setup automatically, cleanup before removal, and expose useful local environment actions when the repo has stable task commands.
7. Use `references/worktree-repair-playbook.md` for Codex local environments, DDEV lanes, dependency installation, mise trust, env/data setup, Vite/assets, storage, search, mobile boundaries, and cleanup ownership.
8. Run setup inside a fresh test worktree; if it cannot reach `READY`, patch and repeat from a fresh test worktree.
10. After `READY`, run a focused product task through a normal agent without explaining setup internals, then audit its command log for setup touches.
11. Run cleanup, verify owned resources are gone, and tighten the contract if setup, cleanup, or product-agent behavior fails.
12. Clean up disposable branches, worktrees, processes, and owned local services.
13. Summarize setup, cleanup, Codex environment file, changed automation files, verification evidence, and cleanup.

## Rules

- Use only commands and URLs found in the repo or clearly implied by project config.
- Do not invent setup commands, secrets, production credentials, or build commands.
- Run Laravel/PHP commands inside DDEV unless explicitly told otherwise.
- For host JavaScript commands, use the package manager already used by the repo.
- Use explicit commands from repo docs and `CHECKLIST.md` over collector-guessed checks.
- `READY` means required services, env, storage, search, seed data, Vite/assets, and app URL checks pass.
- Do not trust summaries as audit evidence; inspect command logs for what ran before and after `READY`.
- Codex local environment setup must call the repo setup script; do not create a second setup path.
- Codex local environment cleanup must call the repo cleanup script; do not inline cleanup logic.
- Keep mobile out of the default web setup path unless explicitly asked for mobile readiness.
- Product agents consume a `READY` worktree; they do not create worktrees, run setup, run cleanup, or repair setup by hand.
- Do not touch the main worktree while testing a disposable worktree unless explicitly asked.
