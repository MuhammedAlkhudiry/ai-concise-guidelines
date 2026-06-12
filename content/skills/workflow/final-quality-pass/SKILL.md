---
name: final-quality-pass
description: Final quality pass after implementation, bug fixes, refactors, branch syncs, or conflicts, covering simplification, maintainability, coverage, checks, hardening, and make it ready prompts.
---

# Final Quality Pass

Orchestrate the finishing work without replacing the focused skills.

## Workflow

1. Use `code-simplifier` to simplify the current diff and remove unnecessary complexity.
2. Use `code-quality-review` to catch structural regressions, ownership drift, and missed simplifications.
3. Use `test-coverage-audit` to prove existing coverage and add focused missing tests for changed behavior.
4. Use `refactor-opportunities` to name worthwhile follow-up improvements without implementing them.
5. Use `check-and-fix` to run project checks, fix task-related failures, and report results.

## Large Surfaces

- When the pass spans many files, modules, or behaviors, use subagents when available and delegation is allowed instead of doing a shallow solo scan.
- Split work by focused skill or disjoint code area: simplification, structural review, coverage, or follow-up refactors.
- Keep the main agent responsible for the final diff, synthesis, conflicts, verification choices, and final report.

## Rules

- Default scope is the current `git diff` unless the user names a narrower target.
- Keep the pass focused on the current task and directly affected code.
- Do not widen into unrelated repo cleanup.
- Implement only fixes that belong to simplification, coverage gaps, structural blockers, or check failures.
- Leave optional refactors as recommendations unless the user explicitly asks to do them.

## Output

- Summarize simplifications made.
- Summarize coverage added or confirmed.
- List checks run and results.
- List remaining refactor opportunities only when they are worthwhile.
