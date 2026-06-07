---
name: check-and-fix
description: "Run project checks from repo-root `CHECKLIST.md` and fix task-related failures, including skipped tests. Use when the user asks to run checks, lint and fix, or verify code quality."
---

# Check and Fix

Run the repo verification checklist, fix task-related failures, and report clean results or blockers.

## Checklist First

Repo-root `CHECKLIST.md` is the source of truth for verification commands.

1. If `CHECKLIST.md` exists, read it first and use its commands.
2. If it is missing, create it from real repo config such as `Makefile`, `package.json`, `composer.json`, `pyproject.toml`, or tool configs.
3. Follow [CHECKLIST.md](CHECKLIST.md) for the file shape.
4. Update it only when a stable project-wide command is missing, wrong, or stale.
5. Run task-specific checks separately without adding them to `CHECKLIST.md`.

## Command Selection

- To discover stable candidates quickly, run:

```bash
bun "$HOME/.agents/skills/check-and-fix/scripts/discover-checks.ts" /path/to/repo
```

- Prefer repo-level commands such as `mise run check` or `make check` when they cover the needed categories.
- Use exact runnable commands, not guesses or alternatives.
- Prefer built-in parallel forms such as `php artisan test --parallel`.
- Keep `CHECKLIST.md` as plain commands, one per line, with `#` comments only when useful.
- Include real verification tools beyond lint/tests when the repo uses them.
- Do not include build commands unless the repo explicitly treats build as verification.

## Fix Loop

1. Run the relevant checklist command.
2. Read the exact failure.
3. Fix only issues related to the current task or directly blocking clean output, including unexpected skipped tests.
4. Re-run the same command.
5. Continue until all relevant checks pass or a real blocker remains.

## Rules

- Use safe auto-fix commands from repo scripts when available.
- Do not skip a checklist item without saying why.
- Report pre-existing unrelated failures instead of widening scope.
- Final report lists each checklist item as `PASS`, `FAIL`, or `BLOCKED`.
