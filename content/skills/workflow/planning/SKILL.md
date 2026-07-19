---
name: planning
description: Planning workflow for in-chat plans by default, plus saved plan creation, updates, execution handoffs, review, reconciliation, and archiving only when the user explicitly asks to persist or manage a plan.
---

## Default Workflow

1. Load `references/plan-shape.md` before writing a plan.
2. Reply with the plan in the conversation.
3. If the plan depends on blocking decisions, ask the user before finalizing it.
4. Before finalizing the plan, run $refactor-opportunities against the affected code. Add a prefactor step only for recommended refactors that should precede the main change; omit optional cleanup.
5. Do not create or update a plan file unless the user explicitly asks to save, persist, or manage a plan.

## Persisted Plans

Use this workflow only when the user explicitly asks to save or persist a plan, or to manage an existing saved plan.

1. Load `references/plan-shape.md` and `references/plan-files.md` before creating, updating, archiving, or executing a persisted plan.
2. Load `references/plan-reconcile.md` before auditing, refreshing, reconciling, polishing, or comparing persisted plans with current code.
3. Store plans under `~/plans/<project-name>/` unless the user explicitly asks for a repo-local file.
4. If the plan depends on blocking decisions, ask the user first. Do not create or update the plan until those decisions are answered.
5. Treat every plan change as a file mutation followed by readback: update the saved plan, then show the updated plan or changed section.
6. If a saved plan becomes wrong, preserve useful content, prune stale detail, revise the incorrect parts, and show the updated plan.
