# Final Quality Pass Protocol

## Scope Inventory

Record the base or comparison target, changed file count, touched apps or layers, main behavior areas, and high-risk surfaces such as auth, billing, permissions, migrations, data model, jobs, external services, mobile/native behavior, broad tests, or fixtures.

If committed branch changes and unstaged edits both exist, inspect them separately. Default to the current PR or `git diff` unless the user names a narrower target.

## Ownership Invariant

Only the main thread/main agent may edit files, run formatters that mutate files, refresh databases, apply migrations, or perform fix loops.

All spawned review threads or subagents are read-only. They may inspect, trace, run read-only commands, and produce findings, but they must not edit files or mutate local state.

The main agent owns synthesis, accepted fixes, implementation order, conflicts, verification choices, final diff state, and the final report.

## Execution Mode

Use a solo pass only for small, single-surface diffs.

Use one read-only review thread per lane when the diff touches more than one app, more than one layer, more than about 20 files, risky surfaces, broad tests or fixtures, or a PR-sized branch. If separate threads are unavailable, use read-only subagents.

For large or cross-surface diffs, review lanes are required unless unavailable.

## Review Lanes

Use focused lanes. Split by app or layer when that is clearer than splitting by skill. Each lane should produce substantial feedback, not a short summary.

- Code simplifier: read-only. Return exact simplifications to make, files and lines, why behavior is preserved, suggested patch shape, risk, and checks.
- Code quality review: read-only. Return findings ordered by severity, file references, why each matters, proposed fix, and required vs optional classification. The main agent presents these to the user unless a blocker is clearly inside the requested final pass.
- Test coverage audit: read-only. Return changed behaviors, existing coverage, missing coverage, exact tests to add or update, and focused test commands. The main agent adds or updates tests.
- Refactor opportunities: read-only. Return `Recommended`, `Optional`, or `No worthwhile refactor opportunities found`. The main agent reports these and does not implement them without approval.
- Check discovery: read-only. Return relevant checklist commands, expensive commands, risky commands, focused checks, and likely blockers. The main agent runs checks, fixes failures, and reruns.

Each lane must include files inspected, flows inspected, findings with file references, required fixes, optional follow-ups, tests or checks impacted, confidence, and an explicit no-findings statement when clean.

If a required lane returns empty output, vague output, errors, or no usable findings, rerun it once with a narrower scope. If the retry is still unusable, mark that lane `DEGRADED` or `BLOCKED`. Do not silently replace required review with a shallow solo scan. A large or cross-surface pass cannot be reported as fully passed when required review evidence is missing.

## Aggregation Plan

After review lanes finish, the main agent must aggregate all feedback into a plan before editing:

1. Dedupe overlapping findings.
2. Reject weak, speculative, or out-of-scope findings.
3. Separate required fixes, coverage gaps, check failures, and optional refactors.
4. Order accepted work so edits are serialized and easy to verify.
5. Work the plan step by step, updating status as each item is completed.

No other thread may mutate the working tree while the main agent works the plan.

## Phase Requirements

Simplification must report deletions, collapsed branches, removed wrappers, cleaned tests, or `PASS` with why nothing was worth simplifying. Do not count implementation work done before this skill as final-pass simplification unless this phase discovered it.

Code quality review must report `PASS`, `FIXED`, `DEGRADED`, or `BLOCKED`, with structural findings, fixes made, and remaining structural risk.

Coverage audit must name changed behaviors, existing tests that cover them, missing coverage, tests added or changed, and meaningful remaining risk. Do not say coverage is confirmed without naming tested behavior.

Refactor opportunities is read-only. Report `No worthwhile refactor opportunities found` or list `Recommended` and `Optional` follow-ups with concrete files, impact, and safest next move.

Check-and-fix must read `CHECKLIST.md` first when present, run relevant commands, fix only task-related failures, rerun failed commands after fixes, classify skipped commands, and separate pre-existing or unrelated failures from current-diff failures. All relevant checks must pass for a `PASS` result.

## Final Gate

Before saying done, confirm every required lane has usable output or an explicit `DEGRADED` or `BLOCKED` status, every review failure is disclosed, every accepted fix was rechecked, all relevant checks passed, remaining failures are classified, and the final response includes evidence from each phase.

## Report Shape

For non-trivial passes, include:

- Scope: base or diff, changed surface, and risk areas.
- Review lanes: each lane as `PASS`, `FIXED`, `DEGRADED`, or `BLOCKED`.
- Simplification: what changed or why it passed cleanly.
- Code Quality: structural findings, fixes, and remaining risk.
- Coverage: already covered, missing, added or changed, and remaining risk.
- Checks: `PASS`, `FAIL`, `BLOCKED`, and `SKIPPED` commands.
- Refactor Opportunities: recommended, optional, or no worthwhile opportunities.
- Result: `PASS`, `DEGRADED`, or `BLOCKED`.

For tiny diffs, keep the final response shorter, but still report simplification, quality, coverage, checks, refactor opportunities, and final result.
