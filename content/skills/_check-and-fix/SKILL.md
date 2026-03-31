---
name: _check-and-fix
description: "Run project checks from repo-root `CHECKLIST.md`, fix task-related failures, and keep the checklist current. Use when the user asks to run checks, lint and fix, or verify code quality."
---

# Check and Fix

Run the repo verification checklist, fix relevant failures, and finish with clean results.

## Checklist First

Treat repo-root `CHECKLIST.md` as the source of truth for verification commands.

1. If `CHECKLIST.md` exists, read it first and use its commands.
2. If it does not exist, create it before running checks.
3. Build the first version from real repo config such as `Makefile`, `package.json`, `composer.json`, `pyproject.toml`, or tool configs.
4. Follow [CHECKLIST.md](CHECKLIST.md) for the file shape.
5. Update the checklist when a listed command is wrong, stale, or missing.

## Command Selection

- Prefer repo-level commands such as `make check` when they already cover multiple categories.
- Use exact runnable commands only. No guesses, placeholders, or "pick one" lists.
- Keep `CHECKLIST.md` as plain command lines, one command per line.
- Do not add markdown structure inside the target repo checklist.
- Use `#` comments only when a short note is required.
- In monorepos, use short `#` repo headers and list that repo's commands directly below the header.
- Include every real verification tool the repo expects, not just linting and tests. Examples: `phpstan`, `rector`, `tsc`, `biome`, `eslint`, framework checks, and repo-specific validators.
- Do not include `build` commands unless the repo explicitly treats build as a required verification gate.

## Fix Loop

1. Run the relevant checklist command.
2. Read the exact failure.
3. Fix only issues related to the current task or directly blocking clean output.
4. Re-run the same command.
5. Continue until all relevant checks pass or a real blocker remains.

## Rules

- Run independent checklist commands in parallel when practical.
- Use the checklist for verification commands, then choose the matching safe fix command from repo scripts or make targets when needed.
- Do not skip a checklist item without saying why.
- If a failure is pre-existing and unrelated, report it clearly instead of widening scope.
- Final report should list each checklist item as `PASS`, `FAIL`, or `BLOCKED`.
- In monorepos, keep checklist entries grouped per repo so the scope of each command is explicit.
