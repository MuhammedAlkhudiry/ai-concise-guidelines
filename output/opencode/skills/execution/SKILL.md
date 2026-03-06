---
name: execution
description: "Implement an approved plan into production-ready code. Use when the user wants to build, code, or execute an already-decided approach."
---

# Execution

Turn an approved plan into working code without drifting scope.

## Before Coding

1. Read the plan file.
2. Read `master-plan.md` if it exists.
3. Read `KNOWLEDGE.md` if it exists.
4. Validate the plan’s assumptions against the codebase.
5. Map the files, callers, tests, and integration points affected.

Load stack-specific skills when needed, for example `typescript`, `react`, or `laravel`.

## Implementation Rules

- Follow the approved plan unless reality forces a change.
- Keep changes aligned with existing patterns.
- Update callers, consumers, and tests as part of the same task.

## Deviation Rules

- Auto-fix bugs, missing critical safeguards, and direct blockers.
- Ask before making architectural changes such as new data models, new infrastructure, contract changes, or major library swaps.
- Record meaningful deviations in the plan file.

## During Execution

- Run the smallest relevant checks first.
- If auth or human-only steps block progress, pause at that checkpoint and say exactly what is needed.
- Do not commit unless the user asked for commits.

## After Execution

Update the plan file and, when present, `master-plan.md` and `KNOWLEDGE.md` with decisions or discovered constraints.

## Boundaries

- No DB, env, or infrastructure changes unless requested.
- No silent scope creep.
- Finish with working code, relevant tests, and clean verification output.
