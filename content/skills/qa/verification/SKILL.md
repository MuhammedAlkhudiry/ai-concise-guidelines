---
name: verification
description: Project verification and `CHECKLIST.md` setup.
---

## Workflow

1. If repo-root `CHECKLIST.md` exists, run its relevant commands.
2. Otherwise discover exact commands from project manifests, task runners, tool configuration, and
   installed help. Prefer one comprehensive repo-level command when it covers the required gate;
   exclude builds unless the project requires them for verification.
3. Keep task-specific checks outside `CHECKLIST.md`.
4. Create or repair `CHECKLIST.md` only when verification setup was requested; use [CHECKLIST.md](CHECKLIST.md) for its format.
5. For verification-only requests, report failures without editing. During implementation, fix task-related fallout and rerun until it passes or is blocked.
6. Report every relevant command as `PASS`, `FAIL`, or `BLOCKED`.
