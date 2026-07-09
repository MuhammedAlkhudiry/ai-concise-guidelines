---
name: persist-plan
description: Persisted plan workflow for saved plans, updates, execution handoffs, review, reconciliation, archiving, and the local `plan` helper CLI.
---

Use this when the user asks to save, update, review, execute from, find, archive, audit, refresh, or reconcile persisted plans.

## Workflow

1. Load `references/plan-files.md` before creating, updating, archiving, or executing a persisted plan.
2. Load `references/plan-reconcile.md` before auditing, refreshing, reconciling, polishing, or comparing persisted plans with current code.
3. Store plans under `~/plans/<project-name>/` unless the user explicitly asks for a repo-local file.
4. If the plan depends on open questions, ask the user first. Do not create or update the plan until the blocking decisions are answered.
5. Treat every plan change as a file mutation followed by readback: update the saved plan, then show the updated plan or changed section.
6. Keep plans short: compact bullets and only details that define the intended change.
8. If a plan becomes wrong, preserve useful content, prune stale detail, revise the incorrect parts, and show the updated plan.

## Rules

- `references/plan-files.md`: plan file shape, lifecycle, and CLI use.
- `references/plan-reconcile.md`: auditing plans against current code across one project or all projects.
- Do not create persisted plan files for casual advice or early workshop discussion before the user is shaping a concrete saved plan.
