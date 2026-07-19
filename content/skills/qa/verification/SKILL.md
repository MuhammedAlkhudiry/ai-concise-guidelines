---
name: verification
description: Project verification from repo-root `CHECKLIST.md`, including command discovery, fix loops, and task-related failure repair.
---

## Workflow

1. If repo-root `CHECKLIST.md` exists, read it and use its commands. Do not load the skill's checklist
   template or toolkit.
2. If it is missing, discover stable commands from `Makefile`, `package.json`, `composer.json`,
   `pyproject.toml`, or tool configs.
3. Only when bootstrapping a new project's verification setup or repairing missing setup, load
   [CHECKLIST.md](CHECKLIST.md) for the proposed file shape and
   [references/toolkit.md](references/toolkit.md) for discovery hints. Derive actual commands from
   the project's manifests, task runner, tool configs, and installed tool help.
4. Create or update repo-root `CHECKLIST.md` only when checklist maintenance or verification setup
   was requested.
5. Run task-specific checks separately without adding them to `CHECKLIST.md`.

- Prefer repo-level commands such as `mise run check` or `make check` when they cover the needed categories.
- Use exact runnable commands, not guesses.
- Prefer a tool's current documented parallel form when the project already uses it.
- Keep `CHECKLIST.md` as plain commands, one per line, with `#` comments only when useful.
- Include real verification tools beyond lint/tests when the repo uses them.
- Do not include build commands unless the repo explicitly treats build as verification.
- If verification depends on git hooks, inspect the repository's existing hook setup and Git's current help before changing it.
- Do not create new hooks unless the user explicitly asks.

## Rules

- For verification-only requests, report failures without editing. Enter the fix loop after authorized implementation or when repair was requested.
- In the fix loop, run the relevant checklist command, read the exact failure, fix task-related fallout, and re-run until it passes or a real blocker remains.
- Use safe auto-fix commands from repo scripts when available.
- Do not skip a checklist item without saying why.
- Final report lists each checklist item as `PASS`, `FAIL`, or `BLOCKED`.
