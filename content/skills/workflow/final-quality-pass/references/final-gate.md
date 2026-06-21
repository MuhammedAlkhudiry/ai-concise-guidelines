# Final Quality Pass Protocol

## Scope Inventory

Record the base or comparison target, changed file count, touched apps or layers, main behavior areas, and high-risk surfaces such as auth, billing, permissions, migrations, data model, jobs, external services, mobile/native behavior, broad tests, or fixtures.

If committed branch changes and unstaged edits both exist, inspect them separately. Default to the current PR or `git diff` unless the user names a narrower target.

## Execution Mode

Use a solo pass only for small, single-surface diffs.

Use subagents when the diff touches more than one app, more than one layer, more than about 20 files, risky surfaces, broad tests or fixtures, or a PR-sized branch. For large or cross-surface diffs, subagents are required unless unavailable.

The main agent owns synthesis, edits, conflicts, verification choices, final diff state, and the final report.

## Subagent Lanes

Use focused read-only lanes. Split by app or layer when that is clearer than splitting by skill.

- Simplification: dead code, wrappers, needless guards, duplicate paths, over-complex tests, and missed deletions.
- Structure: ownership, data flow, contracts, layer drift, wrong abstractions, and compatibility baggage.
- Coverage: changed behavior mapped to existing or new tests, real gaps, and remaining risk.
- Checks: expected verification commands, expensive or risky commands, and likely blockers.
- Refactor opportunities: worthwhile follow-ups only.

Each subagent must return files inspected, flows inspected, findings with file references, required fixes, optional follow-ups, and an explicit no-findings statement when clean.

If a required subagent returns empty output, vague output, errors, or no usable findings, rerun it once with a narrower scope. If the retry is still unusable, mark that lane `DEGRADED` or `BLOCKED`. Do not silently replace required subagent review with a shallow solo scan. A large or cross-surface pass cannot be reported as fully passed when required subagent evidence is missing.

## Phase Requirements

Simplification must report deletions, collapsed branches, removed wrappers, cleaned tests, or `PASS` with why nothing was worth simplifying. Do not count implementation work done before this skill as final-pass simplification unless this phase discovered it.

Code quality review must report `PASS`, `FIXED`, `DEGRADED`, or `BLOCKED`, with structural findings, fixes made, and remaining structural risk.

Coverage audit must name changed behaviors, existing tests that cover them, missing coverage, tests added or changed, and meaningful remaining risk. Do not say coverage is confirmed without naming tested behavior.

Refactor opportunities is read-only. Report `No worthwhile refactor opportunities found` or list `Recommended` and `Optional` follow-ups with concrete files, impact, and safest next move.

Check-and-fix must read `CHECKLIST.md` first when present, run relevant commands, fix only task-related failures, rerun failed commands after fixes, classify skipped commands, and separate pre-existing or unrelated failures from current-diff failures.

## Final Gate

Before saying done, confirm every required lane has usable output or an explicit `DEGRADED` or `BLOCKED` status, every subagent failure is disclosed, every fix was rechecked, remaining failures are classified, and the final response includes evidence from each phase.

## Report Shape

For non-trivial passes, include:

- Scope: base or diff, changed surface, and risk areas.
- Subagents: each lane as `PASS`, `FIXED`, `DEGRADED`, or `BLOCKED`.
- Simplification: what changed or why it passed cleanly.
- Code Quality: structural findings, fixes, and remaining risk.
- Coverage: already covered, missing, added or changed, and remaining risk.
- Checks: `PASS`, `FAIL`, `BLOCKED`, and `SKIPPED` commands.
- Refactor Opportunities: recommended, optional, or no worthwhile opportunities.
- Result: `PASS`, `DEGRADED`, or `BLOCKED`.

For tiny diffs, keep the final response shorter, but still report simplification, quality, coverage, checks, refactor opportunities, and final result.
