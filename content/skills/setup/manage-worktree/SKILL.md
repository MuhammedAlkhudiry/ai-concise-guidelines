---
name: manage-worktree
description: Manage local git worktree readiness. Use when the user asks to create, prepare, repair, verify, document, list, clean up, or delete a repo worktree and its owned local resources.
---

# Manage Worktree

Manage the physical worktree workspace so another agent can start useful development quickly, or remove it cleanly when it is no longer needed.

## Workflow

1. Resolve the target repo, canonical checkout, or worktree root.
2. Inventory path, branch or HEAD, Git registration, dirty status, project resources, and path existence.
3. For fresh worktree creation, run the repo's `scripts/create-worktree.ts`. Do not manually recreate its branch, worktree, or readiness steps.
4. For setup-helper repair, run:

```bash
rtk bun "$HOME/.agents/skills/manage-worktree/scripts/collect-worktree-context.ts" /path/to/repo
```

5. Read repo setup docs, manifests, DDEV config, `.env.example`, and `CHECKLIST.md`.
6. Create or update `scripts/create-worktree.ts` when the repo lacks the creation command; it must support `--dry-run` and call the readiness helper.
7. Treat `scripts/setup-worktree.ts` as the internal readiness helper; edit it only for readiness repair, and keep `--dry-run`.
8. Use `references/worktree-repair-playbook.md` for DDEV lanes, dependency reuse, local services, env/data reuse, Vite startup, mobile boundaries, and deletion cleanup.
9. Re-run the collector after helper edits.
10. Summarize creation, repair, or deletion results.

## Rules

- Use only commands and URLs found in the repo or clearly implied by project config.
- Do not invent setup commands, secrets, production credentials, or build commands.
- During guide authoring, describe setup execution instead of performing it.
- Run Laravel/PHP commands inside DDEV unless explicitly told otherwise.
- For host JavaScript commands, prefer the package manager already used by the repo.
- Use explicit commands from repo docs and `CHECKLIST.md` over collector-guessed checks.
- `create-worktree.ts` is the creation entrypoint; it must print `READY` only when the worktree environment is already usable.
- Ready means required services, env, storage, search, seed data, Vite/assets, and app URL checks pass; otherwise print `BLOCKED` with exact blockers.
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
