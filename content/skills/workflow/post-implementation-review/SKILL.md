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

## Review Checks

- Simplification: remove dead code, stale branches, obsolete helpers, pass-through wrappers, one-use aliases, and incidental structure.
- Tests: delete, rewrite, or merge tests only when remaining coverage still protects the behavior.
- Refactors: classify exposed opportunities as `Do now`, `Do later`, or `Not worth doing`.
- Verification: use repo checklist commands and task-relevant checks; fix only task-related failures.
- Surface readiness: check the actual runtime surface touched by the change.
- Deploy readiness: lead with `ready`, `not ready`, or `ready with named caveats`.
- Load `references/review-checklist.md` when a review needs detailed criteria.

## Report

- Include only sections that apply: `Summary`, `Refactor Opportunities`, `Verification`, `Surface Readiness`, `Deploy Readiness`, `Not safe to delete yet`, or `QA Handoff`.
- Keep findings tied to the actual diff and checks.
- Do not pad the answer with generic deployment or environment checklists.
