---
name: worktree-setup
description: Worktree setup automation for Herd, Laravel, and React Native projects, including setup contracts, cleanup, and fresh-worktree verification.
---

Create project-local automation for one worktree = one full local environment.

## Workflow

1. Exhaustively discover setup surfaces.
2. Write `WORKTREE-SETUP.md` as the contract.
3. Write project-local TypeScript scripts.
4. Verify in a disposable worktree.
5. Remove stale setup code only after the new path covers it.

## Rules

- Discovery covers docs, agent instructions, process config, setup commands, backend env/config/services, seeders, migrations, jobs, package scripts, lockfiles, and frontend codegen.
- Mobile discovery covers React Native/Expo config, mobile env, Metro, simulators, app ids, schemes, and legacy setup.
- Discovery is done when every local resource has a setup owner, cleanup owner, unique worktree name, and verification check.
- `WORKTREE-SETUP.md` uses sectioned plain bullets, setup-specific points, and `(verification: <exact check>)` on every point.
- Default sections are Identity, Herd, Backend Environment, Backend Bootstrap, Mobile Environment, and Processes.
- Scripts are `setup.ts`, `mobile-development.ts`, `verify.ts`, and `clean.ts`, with shared helpers under `lib` and one-operation files under `steps`.
- Put command running, env editing, context, hashing, and logging in `lib`.
- Derive the worktree slug from the checkout path and use it for every isolated name.
- `setup.ts` is backend/web only; do not create mobile-only state in default setup.
- `mobile-development.ts` is opt-in and idempotent.
- `clean.ts` reverses per-worktree state and refuses main-checkout cleanup unless the user explicitly opts in.
- Mutable local resources must be unique per worktree: Herd/app URL, database, Redis/session/queue/Horizon identifiers, search/storage/mail namespaces, Metro port, simulator, env files, and install markers.
- Finish only after the disposable-worktree loop passes: setup, verification, mobile setup, mobile verification, cleanup, removal, and repeat after any fix.
