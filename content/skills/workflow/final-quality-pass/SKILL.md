---
name: final-quality-pass
description: Strict final quality gate after implementation, bug fixes, refactors, branch syncs, conflict resolution, PR prep, or "make it ready" prompts, covering diff inventory, simplification, maintainability, coverage, subagent review, checks, and remaining risk.
---

# Final Quality Pass

Prove the current diff is ready, or report exactly why the pass is degraded or blocked. This is not a changelog and must not collapse into check-running.
Follow [references/final-gate.md](references/final-gate.md) for the full protocol.

## Start

- Default to the current PR or `git diff` unless the user names a narrower target.
- Start with a diff inventory: comparison target, changed file count, touched apps or layers, behavior areas, and risky surfaces.
- Keep the pass focused on the current task and directly affected code. Do not widen into unrelated cleanup.

## Subagents

- Use a solo pass only for small, single-surface diffs.
- Use subagents when the diff touches multiple apps, multiple layers, about 20+ files, risky surfaces, broad tests or fixtures, or a PR-sized branch.
- For large or cross-surface diffs, subagents are required unless unavailable. Split by focused skill, app, or layer.
- Required lanes for large diffs: simplification, structure, coverage, checks, and refactor opportunities.
- Each lane must return files inspected, flows inspected, findings with file references, required fixes, optional follow-ups, and an explicit no-findings statement when clean.
- If a required subagent returns empty, vague, errored, or unusable output, rerun it once with narrower scope; if still unusable, mark the lane `DEGRADED` or `BLOCKED`.
- Do not silently replace required subagent review with a shallow solo scan.

## Workflow

1. Inventory the diff and choose solo or subagent mode.
2. Launch required read-only subagent lanes when the surface requires them.
3. Synthesize subagent findings, dedupe overlaps, and verify high-risk findings directly.
4. Use `code-simplifier` to simplify the current diff and remove unnecessary complexity.
5. Use `code-quality-review` to catch structural regressions, ownership drift, and missed simplifications.
6. Use `test-coverage-audit` to prove existing coverage and add focused missing tests for changed behavior.
7. Use `refactor-opportunities` to name worthwhile follow-up improvements without implementing them.
8. Use `check-and-fix` to run project checks, fix task-related failures, and report results.

## Evidence

- Simplification: deletions, collapsed branches, removed wrappers, cleaned tests, or `PASS` with why nothing was worth simplifying.
- Code quality: `PASS`, `FIXED`, `DEGRADED`, or `BLOCKED`, with structural findings, fixes made, and remaining risk.
- Coverage: changed behaviors, existing tests, missing coverage, tests added or changed, and meaningful remaining risk.
- Refactor opportunities: read-only `No worthwhile refactor opportunities found`, or `Recommended` and `Optional` follow-ups.

## Rules

- Implement only fixes that belong to simplification, coverage gaps, structural blockers, or task-related check failures.
- Leave optional refactors as recommendations unless the user explicitly asks to do them.
- Do not report a large or cross-surface pass as fully passed when required subagent evidence is missing.
- Final output must include scope, subagent status when used, simplification, code quality, coverage, checks, refactor opportunities, and final result.
