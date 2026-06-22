---
name: persist-plan
description: Persisted plan file workflow for saved draft/approved plans, plan file updates, approvals, execution handoffs, review, archiving, and the local `plan` helper CLI.
---

# Persist Plan

Use this skill when the user asks to save, update, approve, review, execute from, find, archive, or reconcile a persisted plan file.

## Workflow

1. Load `references/plan-files.md` before creating, updating, approving, archiving, or executing a persisted plan.
2. Store plans under `~/plans/<project-name>/` unless the user explicitly asks for a repo-local file.
3. Treat every plan change as a file mutation followed by a readback: update the saved plan, then show the updated plan or changed section.
4. Keep new `draft` plans short and high-level.
5. When the user approves a draft, expand the same file into the approved-plan template and set `status: approved`.
6. If an approved plan becomes wrong, set `status: draft`, preserve the detailed content, revise the incorrect parts, and show the updated plan.

## Plan Files

`references/plan-files.md` is the source of truth for plan file shape, lifecycle, approved-plan template, and CLI use.

## Rules

- Do not create persisted plan files for casual advice or early workshop discussion before the user is shaping a concrete saved plan.
