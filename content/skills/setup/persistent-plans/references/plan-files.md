# Persistent Plan Files

## Layout

```text
~/plans/
  project-name/
    INDEX.md
    2026-05-12-mobile-tree-readonly.md
    2026-05-12-poster-editor-rebuild/
      PLAN.md
      phases/
        01-editor-shell.md
        02-canvas-tools.md
      options.md
    archive/
      2026-05-01-old-done-plan.md
      2026-05-02-old-multi-file-plan/
```

- Keep active plans directly in the project folder.
- Keep completed or obsolete plans in `archive/`.
- Use `INDEX.md` as the active-plan entry point.
- Use a folder when the plan needs supporting files, options, research, screenshots, task breakdowns, or review notes.
- Use `phases/` when one plan contains separable streams of work; keep `PLAN.md` as the orientation layer.

## Metadata

```md
---
status: <current-status>
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: project-name
description: <short list-view summary>
---
```

Update `updated` whenever changing the plan body or status.

## Goal Instructions

Every plan main file must include this section:

````md
## Goal Instructions

Use this prompt when setting the goal:

```text
Execute this plan fully. Treat this file as the contract, preserve every agreed scope boundary, keep the plan status in sync and updated, and verify the listed success signals before finishing.
```

Success means:
- <observable end state>
- <required verification>
````

Keep phase statuses readable from the main plan or index when they matter for cleanup.
