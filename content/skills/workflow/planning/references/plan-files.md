# Plan Files

Plan files are Markdown scratchpads with memory. Keep them short.

The AI authors plan files directly: create files, edit content, archive plans, and update the project index.

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
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: project-name
description: Short list-view summary
---
```

A plan is archived only when it is moved into `archive/`.

Update `updated` whenever changing the plan body.

## New Plans

Use the same body structure as an in-chat plan from `plan-shape.md`. A persisted plan adds only the required frontmatter and its durable update history.

If new information invalidates a plan, preserve useful content, prune stale detail, revise the wrong parts, and show the updated plan.

## Helper CLI

The `plan` CLI helps find, view, index, and archive plans. It does not author plans.

```bash
plan list --project=<project-name>
plan show --project=<project-name>
plan show auth --project=<project-name>
plan path auth --project=<project-name>
plan archive auth --project=<project-name>
plan index --project=<project-name> --write
```

- `plan show` without a query prints the latest active plan.
- `plan path` prints the path to a matching plan file.
- `plan archive` moves a plan into `archive/` and refreshes `INDEX.md`.
