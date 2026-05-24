---
name: manage-worktree
description: Manage local git worktree readiness. Use when the user asks to create, prepare, repair, verify, document, list, clean up, or delete a repo worktree and its owned local resources.
---

# Manage Worktree

Manage the physical worktree workspace so another agent can start useful development quickly, or remove it cleanly when it is no longer needed.

## Workflow

1. Resolve the target repo, canonical checkout, or worktree root.
2. Inventory path, branch or HEAD, Git registration, dirty status, project resources, and path existence.
3. For setup or repair, run:

```bash
rtk bun "$HOME/.agents/skills/manage-worktree/scripts/collect-worktree-context.ts" /path/to/repo
```

4. Read repo setup docs, manifests, DDEV config, `.env.example`, and `CHECKLIST.md`.
5. Create or update `scripts/setup-worktree.ts`; it must accept a fresh worktree path and support `--dry-run`.
6. Use `references/worktree-repair-playbook.md` for DDEV lanes, dependency reuse, local services, env/data reuse, Vite startup, mobile boundaries, and deletion cleanup.
7. Automate clear soft blockers in the setup script; report only hard blockers.
8. Re-run the collector after setup-helper edits.
9. Summarize setup script changes or deletion results.

## Rules

- Use only commands and URLs found in the repo or clearly implied by project config.
- Do not invent setup commands, secrets, production credentials, or build commands.
- During guide authoring, describe setup execution instead of performing it.
- Run Laravel/PHP commands inside DDEV unless explicitly told otherwise.
- For host JavaScript commands, prefer the package manager already used by the repo.
- Prefer explicit commands from repo docs and `CHECKLIST.md` over collector-guessed checks.
- The setup script must print `READY` when ready and `BLOCKED` with exact blockers when not.
- Keep the setup script idempotent and safe to rerun.
- Keep mobile out of the default web setup path unless explicitly asked for mobile readiness.
- Delegate branch sync, diff review, targeted restore, file history, commit, push, and PR packaging to the relevant git skill.
- When creating or using a new worktree, do not touch the main worktree; do all setup, edits, commands, and cleanup inside the new worktree unless explicitly asked.

## Delete Worktree

1. Start with `git worktree list --porcelain`.
2. Check target dirty status before deleting.
3. Remove clean worktrees with `git worktree remove`, then run `git worktree prune`.
4. Ask before force-removing dirty worktrees.
5. Clean owned filesystem, DDEV, Vite, local service, and dev-server resources.
6. Preserve canonical checkout config, shared caches, production dumps, and unrelated Docker or DDEV projects.
7. Verify Git registration and filesystem/resource cleanup before calling deletion complete.
