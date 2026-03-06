---
name: check-and-fix
description: "Run project checks and fix task-related failures. Use when the user asks to run checks, lint and fix, or verify code quality."
---

# Check and Fix

Run the project checks, fix relevant failures, and finish with clean results.

## Order

1. Prefer `make check` if the repo provides it.
2. Otherwise prefer repo-level make targets such as `make <repo>-check`, `make <repo>-eslint`, `make <repo>-prettier`, `make <repo>-phpstan`, `make <repo>-test`.
3. Only if make targets do not exist, discover commands from `Makefile`, `package.json`, `composer.json`, or `pyproject.toml`.

## What to Run

Cover these categories when they exist:

- Typecheck or static analysis
- Lint
- Format check or formatter fix
- Tests

Run independent checks in parallel when practical.

## Fix Loop

1. Run a check.
2. Read the exact failure.
3. Fix only issues related to the current task or directly blocking clean output.
4. Re-run the failing check.
5. Continue until all relevant checks pass or a real blocker remains.

## Rules

- Prefer auto-fix variants when safe.
- Do not skip failing checks without saying why.
- If a failure is pre-existing and unrelated, report it clearly instead of widening scope.
- Final report should list each category as `PASS`, `FAIL`, or `BLOCKED`.
