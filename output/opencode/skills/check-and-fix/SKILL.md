---
name: check-and-fix
description: Run all checks (typecheck, lint, format, tests) and fix any failures. Use when user says 'check and fix', 'run checks', 'lint and fix', or wants to verify code quality.
---

# Check and Fix

Run all project checks and ensure they pass. Fix any issues found.

## Discover Commands

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

Run each check that exists in the project:

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
