---
name: post-implementation-review
description: Automatically run the full finish-work loop after implementation, bug fixes, refactors, branch syncs, or conflict resolution. Also use when the user asks for cleanup, simplification, refactor opportunities, verification, deploy readiness, or a final review after implementation.
---

# Post Implementation Review

Review completed work until it is simple, checked, and honestly ready.

Run this after the agent believes implementation is done, before the final answer. Run every section by default unless the user asks for specific sections only.

## Workflow

1. Inspect the actual diff, touched files, callers, consumers, tests, imports, exports, config, docs, routes, screens, endpoints, jobs, migrations, and data contracts that matter to the change.
2. Simplify the implementation while preserving real behavior and contracts.
3. Capture refactor opportunities exposed by the work.
4. Run the relevant project checks and fix task-related failures.
5. Verify the changed runtime surface is usable enough for the next human step.
6. Assess deploy readiness from the real change surface.
7. Call `qa-handoff` separately when the user wants a repeatable manual QA handoff with test cases.

## Simplification

- Preserve outputs, side effects, and real contracts. Do not preserve incidental structure.
- For every line, ask whether it still has a job.
- Remove dead code, stale branches, obsolete helpers, compatibility leftovers, comments about removed logic, and one-off abstractions.
- It is ok to do mid-refactor work when the simple end state needs it: create, move, split, or merge files instead of preserving awkward placement.
- Inline wrappers, aliases, pass-through helpers, one-use values, and variables that only rename an expression.
- In JSX/TSX, reduce prop plumbing and pass-through props; let children compute or read clean local data when that is simpler.
- Replace mode and boolean props with simpler component shape, composition, or local conditional render when possible.
- Flatten nesting with early returns and guard clauses. Never use nested ternaries.
- Treat new helpers, fallback paths, guards, retries, null cushions, shims, and normalization layers as guilty until tied to a real boundary.
- Follow local patterns and prefer explicit readable code over clever compression.

## Test Cleanup

Clean tests without an approval gate when removal is clearly safe. If in doubt, keep the test and list it under `Not safe to delete yet`.

Delete, rewrite, or merge tests when the remaining suite still protects the behavior and the candidate is:

- for removed, unreachable, or unsupported behavior
- duplicated by equal or better coverage
- coupled to implementation details
- only fixture/setup noise

Do not delete without stronger proof when a test covers:

- A real bug regression.
- A public contract: API, CLI, event, serialized payload, DB shape, or cross-system behavior.
- Security, auth, permissions, money, destructive actions, or irreversible state changes.
- Boundary behavior such as empty, limit, timezone, rounding, or failure-path handling.
- Integration with external services, queues, jobs, storage, or framework wiring.
- A flaky test where the cause is still unknown.
- Any case where the remaining behavior coverage cannot be shown.

## Refactor Opportunities

List refactors discovered during the work. Keep this tied to real evidence in the touched code.

- `Do now`: small, safe refactors directly tied to the current change.
- `Do later`: larger, riskier, or unrelated improvements that should not expand the current task.
- `Not worth doing`: possible cleanup that would add churn without meaningful clarity, safety, or maintainability.

## Verification

Use repo-root `CHECKLIST.md` when it exists. Run the relevant checklist commands, targeted tests, lint, typecheck, format, or smoke checks that match the changed surface.

- Prefer safe auto-fix commands when available.
- Fix only task-related failures.
- Report unrelated or pre-existing failures without widening scope.
- Keep task-specific checks out of `CHECKLIST.md`.

## Surface-Specific Readiness

Check the actual surface touched by the change so the final answer does not claim readiness from code checks alone.

- For browser work, verify the relevant URL responds before sharing it.
- For mobile work, verify the simulator/device, installed app, Metro or native runtime, and the changed screen or starting state.
- For API/client work, verify both payload shape and the consumer path that uses it.
- For jobs, queues, storage, mail, webhooks, cache, search, or realtime work, verify the local service state needed for the change.
- For branch syncs and conflict resolution, compare the branch to the target base and verify the merged surfaces still work.

Keep this scoped to the touched surface. Do not turn it into a generic environment audit.

## Deploy Readiness

Review whether the current diff is genuinely deployable.

1. Inspect touched code paths and relevant callers.
2. Verify the checks that match the changed surface.
3. Look for change-specific rollout risks, data risks, cache/state risks, background-job risks, permission risks, and user-visible regressions.
4. Assume routine deploy-script chores are already handled, such as migrations, cache refreshes, queue restarts, and asset deployment.
5. Lead with the verdict: ready, not ready, or ready with named caveats.

Mention only change-specific risks and checks. Do not pad the answer with generic deployment checklists.

## Report

Include only sections that apply:

- `Summary`: what changed and what was simplified.
- `Refactor Opportunities`: `Do now`, `Do later`, and `Not worth doing` items.
- `Verification`: checks run, pass/fail/blocker status, and unresolved failures.
- `Surface Readiness`: runtime surface checked and any remaining setup gaps.
- `Deploy Readiness`: final verdict and named caveats.
- `Not safe to delete yet`: uncertain cleanup that needs more proof.
- `QA Handoff`: say `Use qa-handoff` when the user wants manual QA cases.
