# Worktree Repair Playbook

Use this when a fresh worktree setup helper can safely repair local setup friction instead of reporting it as documentation.

## DDEV Lanes

- Treat DDEV project-name or host-port collisions as soft blockers when a per-worktree lane is safe.
- Use deterministic, short DDEV names based on the worktree folder slug.
- Put the DDEV lane override in the worktree's `.ddev/config.worktree.yaml`.
- Never mutate the canonical checkout's DDEV config.
- Keep the canonical checkout's DDEV project name and stable URL reserved for the original checkout.
- Assign a deterministic free `host_webserver_port` when local lanes can collide.
- Retry `ddev start` with a new free port if DDEV reports a bind or port conflict.
- If changed DDEV names affect app URLs, update only fresh-worktree local env/config needed for local web readiness.

## Dependencies

- Reuse ignored dependency directories such as `vendor` and `node_modules` from the canonical checkout when lockfiles match.
- Use symlinks only when the runtime can follow them.
- For container-visible dependencies such as Laravel `vendor` inside DDEV, copy or mount them so `ddev artisan` works inside the fresh lane.
- Report the install command as a hard blocker when dependency reuse cannot meet the 1-minute target.
- When dependency reuse comes from a canonical checkout, create the fresh worktree from the canonical checkout's `HEAD` or another ref with matching lockfiles.
- Do not default to `origin/main` when that makes lockfiles diverge from the warm dependency source.

## Data And Services

- Run project-local migrations after required services are ready.
- Use the smallest useful local or QA seeder, then verify the seeded QA fixture exists before printing `READY`.
- Use seeders and fixtures as the default data path.
- If realistic production-like data is needed, mention `~/db-dumps` and `prod-db-to-ddev`.
- Never import production data without explicit approval.
- If a Laravel web app is configured for S3 and no local S3 service exists, add DDEV MinIO support.
- For MinIO, set fresh-worktree env values to local credentials, endpoint, path-style mode, and a local bucket, then create or check the bucket after DDEV starts.

## Frontend Startup

- For Laravel/Vite apps, make normal dev-server startup deterministic instead of adding a browser-QA-only wrapper.
- Remove stale ignored `public/hot` files as hygiene.
- Expose a simple command or script that starts Vite on `127.0.0.1` with a free strict port so browser QA and regular agents use the same path.

## Mobile

- Keep mobile out of the default web setup path unless the user explicitly asks for mobile readiness.
- If the monorepo has a mobile app with warm host-side dependencies, include its `node_modules` reuse when lockfiles match so mobile typecheck/lint can start without a fresh install.
