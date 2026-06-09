---
name: init-worktree-automation
description: Codex worktree automation setup or repair for missing scripts/setup-worktree.ts, scripts/cleanup-worktree.ts, automatic readiness, or broken local-environment setup.
---

# Init Worktree Automation

Create or repair the repo-owned automation that makes Codex-created worktrees ready and cleans up their owned resources.

## Workflow

1. Resolve the canonical checkout and a disposable test worktree.
2. Inventory repo docs, manifests, `.env.example`, DDEV config, services, ignored deps, and checks:

```bash
rtk bun "$HOME/.agents/skills/init-worktree-automation/scripts/collect-worktree-context.ts" /path/to/repo
```

3. Read repo setup docs, manifests, DDEV config, `.env.example`, and `CHECKLIST.md`.
4. Create or update `scripts/setup-worktree.ts`; it must accept the Codex-created worktree, use Codex path env vars when present, stay idempotent, support `--dry-run`, print `READY` only after verification passes, and print `WORKTREE_NOT_READY` with exact blockers otherwise.
5. Create or update `scripts/cleanup-worktree.ts`; it must remove only resources owned by the Codex-created worktree and leave Git worktree removal to Codex.
6. Create or update `.codex/environments/environment.toml` so Codex-created worktrees run setup automatically and cleanup before removal.
7. Use `references/worktree-repair-playbook.md` for Codex local environments, DDEV lanes, dependency reuse, env/data reuse, Vite/assets, storage, search, mobile boundaries, and cleanup ownership.
8. Run the setup command inside a fresh test worktree.
9. If setup cannot reach `READY`, patch the setup script and repeat from a fresh test worktree.
10. After `READY`, run a tiny product task through a normal agent without explaining setup internals, then audit its command log for setup touches.
11. Run cleanup in the disposable worktree and verify owned local resources are gone.
12. If setup fails, cleanup fails, or product work touches setup after `READY`, tighten the skill/script contract and repeat from a fresh test worktree.
13. Clean up disposable branches, worktrees, processes, and owned local services.
14. Summarize setup, cleanup, Codex environment file, changed automation files, verification evidence, and cleanup.

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
- Product agents only consume a `READY` worktree; they do not create worktrees, run setup, run cleanup, or repair setup by hand.
- Do not touch the main worktree while testing a disposable worktree unless explicitly asked.
