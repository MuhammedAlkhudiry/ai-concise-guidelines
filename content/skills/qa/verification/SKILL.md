---
name: verification
description: Use after implementation, fixes, refactors, UI tweaks, QA work, or before claiming work is done to choose and run the right verification checks with evidence.
---

# Verification

Verify at the right depth for the actual change. Evidence before completion claims.

## Workflow

1. Identify what changed: behavior, UI, data, config, docs, tests, or tooling.
2. Choose relevant checks from repo docs, `CHECKLIST.md`, package scripts, related tests, and touched code.
3. Use `check-and-fix` when project-wide type-check, lint, format, or test commands are needed.
4. Run independent checks in parallel when the tooling supports it.
5. Report what passed, what failed, and what was intentionally skipped.

## Rules

- Do not require tests for simple non-behavioral changes.
- Keep tests for behavior changes, bug fixes, and new features.
- When builds are the right verification step, clean up generated or compiled files unless they are intentional tracked outputs.
- For UI tweaks, stop after the smallest useful visual check.
- Treat repo-root `CHECKLIST.md` as project-wide verification commands.
- Prefer parallel test workers and concurrent unrelated checks.
- For flaky-looking failures, suspect dirty test data or parallelism before deeper debugging.
- Do not claim success without fresh verification evidence.
