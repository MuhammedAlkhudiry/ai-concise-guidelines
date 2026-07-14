---
name: worktree
description: Worktree environments for Herd, Laravel, and React Native projects: create or repair project-local setup automation, or provision, verify, use, and clean an existing worktree.
---

Manage one worktree as one full local environment.

## Choose a branch

- **Create or repair** when the project needs new or corrected worktree automation.
- **Run** when the project already has `WORKTREE-SETUP.md` and its setup scripts.
- Do not silently switch from Run to Create or repair. Report missing or broken automation unless the user's request permits changing it.

## Create or repair

1. Exhaustively discover setup surfaces.
2. Write `WORKTREE-SETUP.md` as the contract.
3. Write project-local TypeScript scripts.
4. Verify in a disposable worktree.
5. Remove stale setup code only after the new path covers it.

### Rules

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

### Solo

- Treat Solo projects and command records as per-worktree resources.
- Setup registers the checkout and starts its configured processes through Solo. Verification confirms ownership; cleanup stops and deletes the Solo project.
- Trust only exact commands loaded from the project process config. Keep automatic trust for later changes disabled so changed commands require setup or a new trust decision.

## Run

1. Read the repository instructions and `WORKTREE-SETUP.md` before creating or changing local state.
2. Create or enter the intended worktree and confirm its branch and path.
3. Run the documented `setup.ts` entrypoint, then run `mobile-development.ts` only when mobile work is needed.
4. Run `verify.ts` and resolve setup failures before starting project work.
5. Keep commands, processes, URLs, services, data, and app interaction scoped to the current worktree.
6. Run `clean.ts` before removing the worktree when cleanup is requested or the consuming workflow owns disposal.

### Rules

- Follow the repository contract exactly; do not invent alternate setup commands or bypass a broken intended path.
- After mobile setup, explicitly select the simulator created for the current worktree for all mobile commands, verification, and app interaction; never use another worktree's simulator.
- Run is complete only when `verify.ts` passes and every required process or mobile target belongs to the current worktree.
