# Worktree Repair Playbook

Use this when a fresh worktree setup helper can safely repair local setup friction instead of reporting it as documentation.

## Codex Local Environment

- Add `.codex/environments/environment.toml` so Codex-created worktrees run setup automatically.
- Keep the Codex setup script tiny; it should call the repo setup script instead of duplicating setup logic.
- Use this default shape:

```toml
name = "Project"

[setup]
script = '''
bun scripts/setup-worktree.ts "${CODEX_WORKTREE_PATH:-$PWD}"
'''
```

- If the repo does not use Bun, use the repo's existing package manager or executable style.
- In `scripts/setup-worktree.ts`, treat `CODEX_WORKTREE_PATH` as the target worktree when present.
- Treat `CODEX_SOURCE_TREE_PATH` as the canonical source checkout when present.
- Fall back to `$PWD` and Git worktree discovery for manual runs outside Codex.
- Do not put secrets, machine-specific absolute paths, or duplicated readiness logic in `environment.toml`.

## Codex Local Environment Actions

- Add actions to `.codex/environments/environment.toml` when the repo has stable commands that people run often.
- Use TOML array tables. Each action has `name`, `icon`, and `command`; `platform` is optional.
- Valid icons are `tool`, `run`, `debug`, and `test`.
- Valid platform values are `darwin`, `linux`, and `win32`.
- Prefer top-level aggregate commands first: check, format, lint, and typecheck.
- Add only major scoped commands that are genuinely useful as shortcuts, such as build, tests, or smoke. Do not dump every task into the app top bar.
- Preserve the repo's command conventions in action commands. For example, if the repo requires an `rtk` prefix and uses `mise`, write `rtk mise run check`; otherwise use the repo's normal command shape.

Example:

```toml
[[actions]]
name = "Check"
icon = "test"
command = "mise run check"

[[actions]]
name = "Build"
icon = "run"
command = "mise run build"
```

## Codex Cleanup Environment

- Add a `[cleanup]` script to `.codex/environments/environment.toml` when setup creates owned local resources.
- Keep the Codex cleanup script tiny; it should call the repo cleanup script instead of duplicating cleanup logic.
- Use this default shape:

```toml
[cleanup]
script = '''
bun scripts/cleanup-worktree.ts "${CODEX_WORKTREE_PATH:-$PWD}"
'''
```

- Cleanup runs before Codex removes the worktree; do not remove the Git worktree path yourself.
- Stop only resources clearly owned by that worktree: background processes, DDEV lane, containers, volumes, ready marker, and local temp/runtime files.
- Never touch the canonical checkout, shared dependency caches, production dumps, or unrelated Docker/DDEV projects.
- Print clear live progress with `[cleanup] ...` stage labels.
- If cleanup cannot finish automatically, print exact blockers.

## Setup Boundary

- Product agents receive an already-prepared secondary worktree path, or the canonical checkout for normal local work.
- The setup script is the only setup authority during Codex/local-environment setup.
- The canonical checkout is not prepared by `scripts/setup-worktree.ts`; use normal repo instructions there.
- In secondary worktrees, product agents require `.codex/worktree-ready.json` with `READY` before coding, checking, QA, or product work.
- Product agents do not create worktrees, run setup, run cleanup, edit env files, start DDEV by hand, install dependencies, run migrations or seeders, start Vite, repair storage, repair search, or recreate setup steps from logs.
- Running setup when `.codex/worktree-ready.json` reports `READY` is failure.
- If readiness is missing before product work, the product agent stops with `WORKTREE_NOT_READY`.
- If readiness disappears after `READY`, product work stops with `WORKTREE_NOT_READY`; the agent does not repair setup manually.

## Ready Contract

- `READY` means the product can be worked on, not merely that the setup script finished.
- Verify required services, env, dependencies, database state, seed or fixture data, storage, search, background asset servers, and app URLs before printing `READY`.
- For Laravel apps, inspect `ddev artisan list` and run project prepare/generate commands that create worktree-readiness files or state before printing `READY`.
- Skip unrelated prepare/generate commands; no readiness-generating artisan work should be left for product agents after `READY`.
- Include product-specific working URLs such as login, dashboard, API health, or fixture pages when they are needed for normal product work.
- Built-in verification commands must target the prepared worktree URL by default, not the canonical checkout URL.
- Treat optional helper or admin services as non-blocking unless product work depends on them.
- Start background dev servers from setup when they are required for normal browser or app work.
- Verify background dev servers with an HTTP or health check, not only by process existence.
- Record enough process or service ownership for cleanup.

## Verification URLs

- Inventory repo-local URL defaults that can send checks, smoke tests, browser tests, callbacks, or API calls to the canonical checkout.
- Scan `.env.example`, project env files, package scripts, mise tasks, browser test configs, app config, QA docs, and agent docs.
- For secondary worktrees, override only worktree-local runtime values such as `.env`, generated local config, setup-exported env vars, ready marker metadata, or a smoke-command wrapper.
- Do not mass-edit source configs just because they contain canonical URLs.
- Prefer env values such as `APP_URL`, `PLAYWRIGHT_BASE_URL`, API base URLs, callback URLs, and test host URLs.
- `READY` is incomplete when a normal verification command still defaults to the canonical checkout URL.

## Progress Output

- Print clear live progress before long setup steps so Codex setup UI does not look stuck.
- Use stable stage labels such as `[setup] run ddev start` or `[setup] install node_modules`.
- Print before DDEV start, dependency install, env writes, migrations, seeders, storage/search repair, Vite startup, and URL checks.
- Keep final summaries and `READY`, but do not rely on final output as the only feedback.
- Avoid dumping noisy command output unless a command fails.

## Parallel Setup

- Run independent setup work in parallel inside explicit phases, then wait at readiness boundaries.
- Local config writes, stale file cleanup, tool trust, host-side installs, and service startup can overlap when they do not share mutable state.
- Keep container-bound installs and artisan commands behind service readiness and dependency barriers.
- Keep migrations, seeders, search imports, and coupled data mutations ordered unless repo docs prove they are independent.
- Run final readiness checks together only after all required setup work has finished.

## Tooling Bootstrap

- If the repo uses `mise`, make mise trust non-interactive inside setup before running `mise run` commands.
- Prefer the repo's documented bootstrap command; otherwise use `mise trust` from the worktree root.
- Print a live progress line such as `[setup] run mise trust`.
- If tool trust or bootstrap cannot be established automatically, return `WORKTREE_NOT_READY` with the exact blocker.
- After `READY`, normal agents must not repair tool trust manually.

## Agent Audit Loop

- Create a fresh disposable worktree only for automation audits.
- Run setup inside that fresh worktree and require `READY`.
- If setup fails, patch the setup script or skill wording, delete the disposable worktree, and repeat from a fresh worktree.
- After `READY`, give a normal agent a tiny product task and the worktree path only.
- Do not explain the setup contract, worktree internals, or forbidden commands to the audited agent.
- Pass only when Codex setup reaches `READY`, then the agent completes product work without any setup or cleanup operation.
- Use command logs as evidence; final summaries are not enough.
- If the audited agent skips setup, strengthen the trigger wording or repo setup gate.
- If the audited agent touches setup after `READY`, strengthen the boundary in the skill, repo instructions, or setup script output.
- Clean up the audit worktree, branch, background processes, DDEV lane, containers, volumes, and other resources owned by the audit.

## DDEV Lanes

- Treat DDEV project-name or host-port collisions as soft blockers when a per-worktree lane is safe.
- Use deterministic DDEV names based on the worktree folder slug.
- Put the DDEV lane override in the worktree's `.ddev/config.worktree.yaml`.
- Never mutate the canonical checkout's DDEV config.
- Keep the canonical checkout's DDEV project name and stable URL reserved for the original checkout.
- Assign a deterministic free `host_webserver_port` when local lanes can collide.
- Retry `ddev start` with a new free port if DDEV reports a bind or port conflict.
- If changed DDEV names affect app URLs, update only fresh-worktree local env/config needed for local web readiness.

## Dependencies

- Install ignored dependency directories such as `vendor` and `node_modules` in the prepared worktree from the project lockfiles.
- Use the repo's package managers and documented install commands.
- For container-visible dependencies such as Laravel `vendor` inside DDEV, run the install through DDEV so `ddev artisan` works inside the fresh lane.
- Report the exact install command as a hard blocker when dependency installation cannot meet the 1-minute target.
- Create the fresh worktree from the canonical checkout's `HEAD` or another ref with matching lockfiles.
- Do not default to `origin/main` when that makes lockfiles diverge from the prepared worktree.

## Data And Fixtures

- Run project-local migrations after required services are ready.
- For Laravel apps, run the normal `DatabaseSeeder` by default with `ddev artisan db:seed --force`.
- Use a specific local, demo, fixture, or workflow seeder only when repo docs name it as the standard setup path, or when `DatabaseSeeder` delegates to it.
- Verify required seeded users, tenants, records, or fixture pages exist before printing `READY`.
- Use seeders and fixtures as the default data path.
- If realistic production-like data is needed, mention `~/db-dumps` and `prod-db-to-ddev`.
- Never import production data without explicit approval.
- If a Laravel web app is configured for S3 and no local S3 service exists, add DDEV MinIO support.
- For MinIO, set fresh-worktree env values to local credentials, endpoint, path-style mode, and a local bucket, then create or check the bucket after DDEV starts.

## Frontend Startup

- For Laravel/Vite apps, make normal dev-server startup deterministic instead of adding a browser-only wrapper.
- Remove stale ignored `public/hot` files as hygiene.
- Expose a simple command or script that starts Vite on `127.0.0.1` with a free strict port so browser work and regular agents use the same path.
- Stop stale non-ready Vite processes owned by the worktree before starting a new one.
- Write Vite stdout and stderr to an owned log file, then include the log tail in `WORKTREE_NOT_READY` when Vite exits or times out.

## Mobile

- Keep mobile out of the default web setup path unless the user explicitly asks for mobile readiness.
- If the monorepo has a mobile app, include its dependency install path so mobile typecheck/lint can start from the prepared worktree.

## Deletion Cleanup

- Treat deletion as two jobs: unregister the Git worktree and remove resources owned by that worktree.
- Start from `git worktree list --porcelain` so paths and detached HEAD states are parsed safely.
- Remove clean worktrees first, then run `git worktree prune`.
- Do not force-remove dirty worktrees without explicit approval.
- After Git removal, check whether the filesystem path still exists; remove only leftovers that belong to the deleted worktree.
- Stop worktree-specific DDEV projects before deleting their local config or volumes.
- Remove DDEV resources only when their project name or labels clearly match the deleted worktree lane.
- Preserve shared dependency caches, global package-manager caches, production dumps, canonical checkout resources, and unrelated Docker or DDEV projects.
- Verify deletion with both `git worktree list --porcelain` and filesystem/resource checks.
