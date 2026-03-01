---
name: check-and-fix
description: "Run all checks (typecheck, lint, format, tests) and fix any failures. Use when user says 'check and fix', 'run checks', 'lint and fix', or wants to verify code quality."
---

# Check and Fix

Run all project checks and ensure they pass. Fix any issues found.

## Preferred Entry Point

Use monorepo Make targets first so you do not manually rediscover checks:

1. If root `Makefile` has `check`, run `make check`
2. If `check` is missing, run per-repo targets:
   examples (not exhaustive): `make <repo>-prettier`, `make <repo>-eslint`, `make <repo>-phpstan`, `make <repo>-test`, or aggregate `make <repo>-check`
3. Only fall back to manual discovery when these targets do not exist

Tool target names are project-defined; expected coverage categories are: typecheck/analysis, lint, format, tests.

## Discover Commands (Fallback Only)

First, find how checks are run in this project:

```bash
# Check package.json scripts
cat package.json | grep -E "(lint|test|type|check|build)" 

# Check composer.json scripts
cat composer.json | grep -E "(lint|test|type|check|analyse)"

# Check Makefile
cat Makefile | grep -E "(lint|test|type|check)"
```

Common patterns:
- **TypeScript**: `npm run typecheck`, `pnpm tsc --noEmit`, `yarn type-check`
- **Lint**: `npm run lint`, `pnpm lint`, `composer lint`
- **Format**: `npm run format`, `pnpm prettier --check .`
- **Tests**: `npm test`, `pnpm test`, `composer test`, `php artisan test`
- **PHP Analysis**: `composer analyse`, `./vendor/bin/phpstan`

## Run Checks

If Make targets exist, run them and use their output as the source of truth.

If no Make targets exist, run each check that exists in the project:

1. **Type check** (if TypeScript)
2. **Lint** (ESLint, PHPStan, etc.)
3. **Format check** (Prettier, PHP-CS-Fixer)
4. **Tests** (Jest, PHPUnit, etc.)

## Fix Failures

For each failing check:

1. Read the error output carefully
2. Fix the issue in code
3. Re-run that specific check to verify
4. Continue to next check

## Rules

- **Prefer Make check targets** — Use `make check`, tool-specific commands (for example `make <repo>-prettier`), or `make <repo>-check` when available
- **Fix, don't skip** — All checks must pass
- **Stay in scope** — Only fix issues related to current work, flag pre-existing issues
- **Re-run after fixes** — Verify each fix before moving on
- **Report blockers** — If a check fails for reasons outside your control, report it

## Output

When complete, report:
```
Checks completed:
- Typecheck: PASS/FAIL
- Lint: PASS/FAIL  
- Format: PASS/FAIL
- Tests: PASS/FAIL (X passed, Y failed)
```
