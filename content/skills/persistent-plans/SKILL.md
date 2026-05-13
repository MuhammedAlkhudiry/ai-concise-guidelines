---
name: persistent-plans
description: Manage persistent plan files in ~/plans/<project-name>. Use when creating, updating, finding, reviewing, cleaning up, completing, archiving, or marking stale plan files.
---

# Persistent Plans

Manage persistent plan files outside project repos.

## Location

Use `~/plans/<project-name>/` for persistent plan files.

- Derive `<project-name>` from the canonical repo folder, not a temporary worktree path.
- Keep active plans directly in the project folder.
- Keep completed or obsolete plans in `archive/`.
- Use `INDEX.md` as the active-plan entry point.

```text
~/plans/
  awraq-project/
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

## Workflow

1. Create or update plan files only when the user explicitly asks for a plan file.
2. Resolve the project name from the user's target repo or current working directory.
3. Read `~/plans/<project-name>/INDEX.md` before creating a new plan.
4. Create the project folder, `archive/`, and `INDEX.md` when they are missing.
5. Store a simple plan as `YYYY-MM-DD-short-slug.md`.
6. Store a multi-file plan as `YYYY-MM-DD-short-slug/` with `PLAN.md` as the main entry point.
7. Use `phases/` inside a plan folder when the plan has distinct workstreams, stages, or nested decisions.
8. Add frontmatter with `status`, `created`, `updated`, and `project` to the plan's main file.
9. Keep `INDEX.md` limited to active plans and the shortest useful context.
10. When a plan is complete, set `status: done`, update `updated`, move the file or whole folder to `archive/`, and remove it from `INDEX.md`.
11. When a plan is obsolete, set `status: stale`, update `updated`, move the file or whole folder to `archive/`, and remove it from `INDEX.md`.

## Main File Metadata

```md
---
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: project-name
---
```

## Rules

- Do not store durable plans in repos unless the user explicitly asks.
- Do not create plan files for ordinary planning discussions. Keep those plans in chat.
- Write plans as explicit commitments. Avoid conditional or uncertain wording like `if`, `when`, `decide`, or `maybe`.
- Do not delete plans automatically. Archive instead.
- Do not archive ambiguous plans without asking.
- Do not force a fixed plan template. Match the plan structure to the work.
- Use a folder when the plan needs supporting files, options, research, screenshots, task breakdowns, or review notes.
- Use phases when one plan contains separable streams of work; keep `PLAN.md` as the orientation layer.
- Keep phase statuses readable from the main plan or index when they matter for cleanup.
- Keep plans practical and short. Add files and sections only when they carry useful context.
- Update `updated` whenever changing the plan body or status.
- Preserve historical decisions when archiving; do not rewrite old plans into summaries unless the user asks.
