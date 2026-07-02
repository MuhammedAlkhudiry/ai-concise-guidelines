---
name: persist-plan
description: Persisted plan file workflow for saved draft/approved plans, plan updates, approvals, execution handoffs, review, reconciliation against current code, archiving, and the local `plan` helper CLI.
---

# Persist Plan

Use this when the user asks to save, update, approve, review, execute from, find, archive, audit, refresh, or reconcile persisted plans.

## Workflow

1. Load `references/plan-files.md` before creating, updating, approving, archiving, or executing a persisted plan.
2. Load `references/plan-reconcile.md` before auditing, refreshing, reconciling, polishing, or comparing persisted plans with current code.
3. Store plans under `~/plans/<project-name>/` unless the user explicitly asks for a repo-local file.
4. If the plan depends on open questions, ask the user first. Do not create or update the plan until the blocking decisions are answered.
5. Treat every plan change as a file mutation followed by a readback: update the saved plan, then show the updated plan or changed section.
6. Keep new `draft` plans short and high-level.
7. When the user approves a draft, expand the same file into the approved-plan template and set `status: approved`.
8. If an approved plan becomes wrong, set `status: draft`, preserve the detailed content, revise the incorrect parts, and show the updated plan.

## Plan Files

`references/plan-files.md` is the source of truth for plan file shape, lifecycle, approved-plan template, and CLI use.

`references/plan-reconcile.md` is the source of truth for auditing existing plans against current code, across one project or all projects.

## Rules

- Do not create persisted plan files for casual advice or early workshop discussion before the user is shaping a concrete saved plan.
