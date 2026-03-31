---
name: _ddev-git-worktrees
description: Make a DDEV Laravel project work with git worktrees. Use when DDEV collides across multiple checkouts, when a repo wants worktree-specific `.ddev.site` URLs, or when a Laravel app in a subdirectory should be served from repo root.
---

# DDEV Git Worktrees

Use this when one repo needs multiple DDEV-backed worktrees at the same time.

## Rules

- Do not hardcode `name:` in `.ddev/config.yaml` if the DDEV project must support multiple worktrees.
- If the app lives in a subdirectory, prefer moving `.ddev/` to repo root so DDEV derives a unique project name from each worktree folder.
- After moving `.ddev/` to repo root, point DDEV at the real app with `docroot`, `composer_root`, and `working_dir`.
- Run `ddev` from the repo root that owns `.ddev/`, not from the app subdirectory.
- Treat generated hidden `.ddev` state as local cache. Do not copy the whole local `.ddev/` directory between worktrees when testing.

## Subdirectory app pattern

For a Laravel app in a subdirectory such as `app/` or `backend/`, use repo-root `.ddev/config.yaml` like:

```yaml
docroot: <app-subdir>/public
composer_root: <app-subdir>
working_dir:
  web: /var/www/html/<app-subdir>
```

Update any extra daemon or worker paths to the subdirectory app path as well.

## Worktree URL rule

- Main checkout URL comes from the main repo folder name.
- Worktree URL comes from the worktree folder name.
- Example: repo `my-app` -> `https://my-app.ddev.site`
- Example: worktree `my-app-feature-auth` -> `https://my-app-feature-auth.ddev.site`

## Verification

1. Run `ddev debug configyaml` from repo root and confirm the derived project name, `docroot`, `composer_root`, and `working_dir`.
2. Run `ddev start` from repo root and verify `ddev exec 'pwd && php artisan --version'`.
3. Create a real git worktree and run `ddev start` there too.
4. Confirm both projects coexist in `ddev list` with different names and URLs.

## Fresh worktree caveat

A fresh git worktree usually does not include gitignored local runtime state. If DDEV starts but the app fails, check for missing local files before blaming the DDEV worktree setup.

Common missing items:

- app `.env`
- `vendor/`
- built frontend assets such as `public/build/manifest.json`

Typical symptoms:

- missing `vendor` breaks `artisan` or worker boot
- missing Vite build returns HTTP `500`

## Testing rule

When validating the setup in another worktree, copy only tracked `.ddev` project files if you need to stage uncommitted changes. Do not copy generated hidden `.ddev` files or local cache/state wholesale.
