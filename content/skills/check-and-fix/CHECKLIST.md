# Verification Checklist Template

Repo-root `CHECKLIST.md` should be a plain command list.

```text
# single repo
composer rector:check
composer phpstan
bun run typecheck
bun run lint
bun run format:check
php artisan test --parallel
# optional when browser flows change: bun run test:e2e

# apps/web
bun --cwd apps/web run typecheck
bun --cwd apps/web run lint

# apps/api
bun --cwd apps/api run test

# packages/shared
bun --cwd packages/shared run typecheck
```

Rules:

- One runnable verification command per line.
- Keep only commands the agent should actually run.
- Keep only stable project-wide verification commands, never task-specific ones.
- Prefer the built-in parallel form when the tool supports it, such as `php artisan test --parallel`.
- Use `#` comments only for short notes or repo headers.
- In monorepos, group commands under short repo headers.
- Include non-linting verification commands too, such as `rector`, `phpstan`, type-checkers, framework health checks, schema checks, or other required validators.
- Do not include `build` commands unless build is explicitly part of the repo's required verification gate.
- Update the checklist rarely, only when a real project-wide verification command changes.
- Replace the example commands with repo-specific commands.
