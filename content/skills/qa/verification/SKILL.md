---
name: verification
description: Project verification from repo-root `CHECKLIST.md`, including command discovery, fix loops, and task-related failure repair.
---

## Workflow

1. If `CHECKLIST.md` exists, read it first and use its commands.
2. If it is missing, discover stable commands from `Makefile`, `package.json`, `composer.json`, `pyproject.toml`, or tool configs.
3. Follow [CHECKLIST.md](CHECKLIST.md) for the proposed file shape and [references/toolkit.md](references/toolkit.md) when the verification setup is weak.
4. Create or update `CHECKLIST.md` only when checklist maintenance was requested.
5. Run task-specific checks separately without adding them to `CHECKLIST.md`.

To discover stable candidates quickly, run:

```bash
bun "$HOME/.agents/skills/verification/scripts/discover-checks.ts" /path/to/repo
```

- Prefer repo-level commands such as `mise run check` or `make check` when they cover the needed categories.
- Use exact runnable commands, not guesses.
- Prefer built-in parallel forms such as `php artisan test --parallel`.
- Keep `CHECKLIST.md` as plain commands, one per line, with `#` comments only when useful.
- Include real verification tools beyond lint/tests when the repo uses them.
- Do not include build commands unless the repo explicitly treats build as verification.
- If verification depends on git hooks, inspect existing setup first; if only `.githooks` exists, use `git config core.hooksPath .githooks`.
- Do not create new hooks unless the user explicitly asks.

## Rules

- For verification-only requests, report failures without editing. Enter the fix loop after authorized implementation or when repair was requested.
- In the fix loop, run the relevant checklist command, read the exact failure, fix task-related fallout, and re-run until it passes or a real blocker remains.
- Use safe auto-fix commands from repo scripts when available.
- Do not skip a checklist item without saying why.
- Final report lists each checklist item as `PASS`, `FAIL`, or `BLOCKED`.
