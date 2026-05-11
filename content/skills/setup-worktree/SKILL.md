---
name: setup-worktree
description: Generate a repo-local setup-worktree.ts script so a fresh git worktree can be created and made usable quickly. Use when the user asks to set up a worktree, document monorepo startup, or make a Laravel/React web project fast for future agents to run.
---

# Setup Worktree

Create `scripts/setup-worktree.ts` so a fresh worktree becomes ready for useful web/backend work quickly.

## Workflow

1. Resolve the target repo or worktree root from the user request.
2. Run the collector from this skill:

```bash
bun content/skills/setup-worktree/scripts/collect-worktree-context.ts /path/to/repo
```

If the skill has been installed outside this source repo, run the copied script from the installed skill directory.

3. Identify the setup path: worktree command, app dirs, package manager, DDEV root/docroot, reusable dependency/env/data/service state, URLs, QA fixture, and first useful check.
4. Read root `AGENTS.md` and `QA.md` first when they exist, then nested `AGENTS.md`, manifests, DDEV config, `.env.example`, and `CHECKLIST.md`.
5. Create or update `scripts/setup-worktree.ts`. The script should accept a fresh worktree path and support `--dry-run`.
6. Make the script fix clear soft blockers: dependency reuse, env reuse, per-worktree DDEV lane, MinIO/local S3, DDEV/service checks, reusable DB fixture checks, and first web/backend checks.
7. Do not leave a soft blocker as documentation only. Either automate it in the script or explain why it is a hard blocker.
8. Re-run the collector after setup-helper edits.
9. In the assistant reply, summarize setup script changes. Flag only hard blockers that cannot be safely repaired automatically.

## Rules

- Use only commands and URLs found in the repo or clearly implied by project config.
- Do not invent setup commands.
- During guide authoring, describe setup execution instead of performing it.
- Do not include build commands as the normal worktree setup path.
- For Laravel/PHP projects, prefer DDEV commands when DDEV exists or repo rules require it.
- For host JavaScript commands, prefer the package manager already used by the repo.
- Separate root, backend, web, and mobile app commands.
- Prefer explicit commands from root `CHECKLIST.md`, `QA.md`, and `AGENTS.md` over collector-guessed checks.
- A 1-minute web start means another agent can create a fresh worktree, run the script, and begin useful web/backend code or checks within 1 minute when the canonical checkout has warm reusable state.
- The setup script must print `READY` when the web worktree is ready and `BLOCKED` with exact blockers when it is not.
- The setup script should be idempotent and safe to rerun.
- A DDEV project-name collision is usually a soft blocker, not a hard blocker. When the repo uses DDEV and a canonical lane is already owned by another checkout, the script should create a unique per-worktree DDEV local config in the fresh worktree when safe, then start/check that lane.
- Per-worktree DDEV names should be deterministic and short, based on the worktree folder slug. The script must not mutate the canonical checkout's DDEV config.
- If changing the DDEV name changes app URLs, the script must update only fresh-worktree local env/config files needed for local web readiness, never tracked production config or canonical env files.
- If a Laravel web app is configured for S3 and no local S3 service exists, add DDEV MinIO support and have the setup script set fresh-worktree env values to local MinIO credentials, endpoint, path-style mode, and a local bucket. Create/check the bucket from the script after DDEV starts.
- For ignored dependency directories such as `vendor` and `node_modules`, reuse the canonical checkout when lockfiles match. Use symlinks when safe; otherwise report the install command as a hard blocker for the 1-minute target.
- When dependency reuse comes from a canonical checkout, the fresh worktree should usually be created from the canonical checkout's `HEAD` or another ref with matching lockfiles. Do not default to `origin/main` if that makes lockfiles diverge from the warm dependency source.
- For local env files such as `.env`, prefer symlinking or copying from the canonical checkout only when the repo already treats that env as local machine state. Never invent secrets or production credentials.
- If you add an uncommitted setup helper, document the command with an absolute path to the canonical checkout helper so a fresh worktree created from `origin/main` can use it before the helper is committed.
- If realistic local data is needed, mention `~/db-dumps` and `prod-db-to-ddev`; never import production data without explicit approval.
- Keep mobile out of the default web setup path unless the user explicitly asks for mobile readiness.

## DDEV Updates

When a DDEV gap is concrete, update DDEV instead of only reporting it.

- Add or adjust project-native DDEV service files for clear Redis, search, or MinIO/S3 needs.
- Add small DDEV commands when they remove repeated setup friction, such as database import, service health checks, or coverage helpers.
- Add per-worktree DDEV lane support when the project has a fixed canonical DDEV name and web worktrees need to run without taking over that lane.
- Keep DDEV edits minimal and consistent with existing `.ddev` patterns.
- Do not invent service credentials or production secrets.
- Treat database imports and production data pulls as external setup steps, not automatic worktree repair.
- If DDEV root is ambiguous, stop and ask before moving or deleting DDEV files.
- If a gap cannot be safely repaired, report it as a blocker in `Flag` and explain the missing decision.

After DDEV edits, run the collector again and update `scripts/setup-worktree.ts` from the repaired project state.

## Verification Model

The real test uses two separate agents:

1. A script agent uses this skill to create or refine `scripts/setup-worktree.ts`.
2. A worktree agent uses only the repo's setup script to create a fresh worktree and start useful web/backend work.

If the second agent cannot start within 1 minute, update the skill or script shape so the first agent fixes the slowdown next time.
