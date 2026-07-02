# Plan Files

Plan files are Markdown scratchpads with memory. They should stay casual while ideas are forming and become detailed only when approved for execution.

The AI authors plan files directly: create files, edit content, change status, approve drafts, return plans to draft, and mark done.

## Layout

```text
~/plans/
  project-name/
    INDEX.md
    2026-06-21-auth-feature.md
    2026-06-21-editor-rebuild/
      PLAN.md
      notes.md
      ui-image.png
      useful-script.ts
      some-pdf.pdf
      some-doc.docx
    archive/
      2026-06-01-old-plan.md
```

- Keep active plans directly in the project folder.
- Keep retired plans in `archive/`.
- Use `INDEX.md` as the active-plan entry point.
- Use a folder only when a plan needs supporting notes, screenshots, research, or separate phase files.

## Metadata

Every plan main file starts with frontmatter:

```md
---
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: project-name
description: Short list-view summary
---
```

Allowed statuses:

- `draft`
- `approved`
- `done`
- `archived`

Update `updated` whenever changing the plan body or status.

## Drafts

New drafts are intentionally short. They capture the current shared thinking without turning early planning into a detailed document.

If a draft would require an `Open Questions` section, stop and ask the user first. Create the plan only after the blocking decisions are answered.

```md
# Auth Feature

## Shape

- Add cookie-session login.
- Reuse the existing user model.
- Keep signup and password reset out of scope.

## Notes

- Trace existing routing and session assumptions before approval.
```

## Approved Plans

Approving a plan means expanding the same file into an execution-ready plan and changing `status` to `approved`.

Approved plans should be detailed enough for a fresh executor to work without relying on chat memory. Use this template by default, omitting sections only when they add no value:

```md
## Goal

What will be true after the plan is executed.

## Context

Why this is worth doing, current behavior, relevant files, local patterns, constraints, and evidence.

## Scope

In scope:

- ...

Out of scope:

- ...

## Implementation Steps

1. ...

Verification after this step:

- `<command>` exits 0 or produces `<expected signal>`.

## Acceptance Criteria

- [ ] ...

## Verification Steps

- ...
```

Approval means "good enough to execute", not frozen. If new information invalidates an approved plan, change `status` back to `draft`, preserve the detailed content, revise the wrong parts, and show the updated plan.

## Helper CLI

The `plan` CLI helps find, view, index, and archive plans. It does not author plans.

```bash
plan list --project=<project-name>
plan list --project=<project-name> --status=draft
plan show --project=<project-name>
plan show auth --project=<project-name>
plan path auth --project=<project-name>
plan archive auth --project=<project-name>
plan archive --clear --project=<project-name>
plan index --project=<project-name> --write
```

- `plan show` without a query prints the latest active plan.
- `plan path` prints the path to a matching plan file.
- `plan archive` moves a plan into `archive/`, marks it `archived`, and refreshes `INDEX.md`.
- `plan archive --clear` archives all active plans with `status: done`.
