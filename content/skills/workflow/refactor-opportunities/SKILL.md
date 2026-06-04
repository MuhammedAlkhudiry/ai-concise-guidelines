---
name: refactor-opportunities
description: Suggest worthwhile refactor opportunities exposed by recent work or a focused code review without editing files. Use after implementation, cleanup, branch sync, conflict resolution, or when the user asks for refactor opportunities, follow-up cleanup, structural improvements, or what should be refactored next.
---

# Refactor Opportunities

Find refactors worth naming. Never edit files.

## Workflow

1. Inspect the actual diff, touched files, nearby callers, tests, data contracts, routes, screens, jobs, and config that matter to the change.
2. Separate real structural opportunities from style preferences, generic cleanup, and unrelated repo noise.
3. Classify each opportunity by value:
   - `Recommended`: meaningful clarity, safety, maintainability, or product leverage.
   - `Optional`: real but lower-value cleanup.
4. For each item, name the concrete code smell, affected files, impact, likely effort or risk, and safest next move.
5. Suggest only. Do not edit files, apply patches, run formatters, or implement refactors.

## Look For

- Framework, standard-library, or existing package APIs replacing custom code or DRY-only helpers.
- Duplicated behavior that wants one real boundary, not a thin wrapper.
- Wrong ownership, misplaced logic, mixed responsibilities, or awkward data flow.
- Dead compatibility paths, obsolete fallbacks, and stale feature branches.
- Manual parsing, query building, serialization, validation, or state handling that a local helper already owns.
- Brittle tests, fixture noise, or coverage tied to implementation details.
- Hidden coupling, misleading names, long functions, deep nesting, or parameter clutter.

## Rules

- Keep findings tied to evidence in the code.
- Stay read-only even when a suggested refactor looks obvious.
- Prefer fewer high-signal items over an exhaustive list.
- Do not suggest abstractions without real duplication, complexity, or boundary pressure.
- Do not preserve backward compatibility when a clean-cut change is correct inside one system.
- Call out compatibility costs when a refactor would keep old shapes alive.
- Include size, effort, risk, tests, or verification only as useful context, not as a scope gate.
- Say `No worthwhile refactor opportunities found` when the diff is already simple.

## Report

Use only the sections that apply:

- `Recommended`
- `Optional`
- `No worthwhile refactor opportunities found`
