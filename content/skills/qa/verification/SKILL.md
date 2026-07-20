---
name: verification
description: Project verification from repo-root `CHECKLIST.md`, including command discovery, fix loops, and task-related failure repair.
---

## Workflow

1. If repo-root `CHECKLIST.md` exists, read it and use its commands.
2. If it is missing, discover stable exact commands from `Makefile`, `package.json`, `composer.json`,
   `pyproject.toml`, or tool configs. Prefer a repo-level command such as `mise run check` or
   `make check` when it covers the needed categories, including real verification tools beyond lint
   and tests but excluding builds unless the repo treats them as verification.
3. Only when bootstrapping a new project's verification setup or repairing missing setup, load
   [CHECKLIST.md](CHECKLIST.md) for the proposed file shape and
   [references/toolkit.md](references/toolkit.md) for discovery hints. Derive actual commands from
   the project's manifests, task runner, tool configs, and installed tool help.
4. Create or update repo-root `CHECKLIST.md` only when checklist maintenance or verification setup was requested. If hooks matter, inspect the existing setup and Git’s current help; never create hooks unless asked.
5. Run task-specific checks separately without adding them to `CHECKLIST.md`, using the tool’s documented parallel form when the project already does.
6. For verification-only requests, report failures without editing. Otherwise, run each relevant
   checklist command, read failures, use safe repo auto-fixes where available, fix task-related
   fallout, and re-run until it passes or a real blocker remains. Do not skip an item without saying
   why; report every item as `PASS`, `FAIL`, or `BLOCKED`.
