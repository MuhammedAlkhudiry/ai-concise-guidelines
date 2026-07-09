---
name: refactor-opportunities
description: Refactor opportunity reports without edits after implementation, cleanup, branch sync, conflict resolution, review, or what-to-refactor prompts.
---

Find worthwhile refactors. Never edit files.

## Workflow

1. Inspect the actual diff, touched files, nearby callers, tests, data contracts, routes, screens, jobs, and config that matter to the change.
2. Separate real structural opportunities from style preferences, generic cleanup, and unrelated repo noise.
3. Classify opportunities as `Recommended` for meaningful clarity, safety, maintainability, or product leverage, or `Optional` for real but lower-value cleanup.
4. For each item, name the concrete code smell, affected files, impact, likely effort or risk, and safest next move.
5. Suggest only. Do not edit files, apply patches, run formatters, or implement refactors.

## Rules

- Framework, standard-library, or existing package APIs replacing custom code or DRY-only helpers.
- Duplicated behavior that wants one real boundary, not a thin wrapper.
- Wrong ownership, misplaced logic, mixed responsibilities, or awkward data flow.
- Dead compatibility paths, obsolete fallbacks, and stale feature branches.
- Manual parsing, query building, serialization, validation, or state handling that a local helper already owns.
- Brittle tests, fixture noise, or coverage tied to implementation details.
- Hidden coupling, misleading names, long functions, deep nesting, or parameter clutter.
- Keep findings tied to evidence in the code.
- For broad targets, split read-only inspection across explorer subagents when useful.
  The main agent owns ranking, dedupe, and filtering.
- Stay read-only even when a suggested refactor looks obvious.
- Prefer fewer high-signal items over an exhaustive list.
- Do not suggest abstractions without real duplication, complexity, or boundary pressure.
- Do not preserve backward compatibility when a clean-cut change is correct inside one system.
- Call out compatibility costs when a refactor would keep old shapes alive.
- Include size, effort, risk, tests, or verification only as useful context, not as a scope gate.
- Say `No worthwhile refactor opportunities found` when nothing is worth naming.

Report only the sections that apply: `Recommended`, `Optional`, or `No worthwhile refactor opportunities found`.
