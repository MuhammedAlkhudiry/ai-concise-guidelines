# Verification Checklist Template

Repo-root `CHECKLIST.md` should be a plain command list.

```text
# single repo
composer rector:check
composer phpstan
bun run typecheck
bun run lint
bun run format:check
bun run test
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
- Use `#` comments only for short notes or repo headers.
- In monorepos, group commands under short repo headers.
- Include non-linting verification commands too, such as `rector`, `phpstan`, type-checkers, framework health checks, schema checks, or other required validators.
- Replace the example commands with repo-specific commands.
