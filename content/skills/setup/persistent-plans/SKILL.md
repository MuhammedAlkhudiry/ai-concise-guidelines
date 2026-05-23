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
3. Read `~/plans/<project-name>/INDEX.md` before creating a new plan. To list active plans or rebuild an index, run:

```bash
plan list --project=<project-name>
plan index --project=<project-name> --write
```

4. Create the project folder, `archive/`, and `INDEX.md` when they are missing.
5. Store a simple plan as `YYYY-MM-DD-short-slug.md`.
6. Store a multi-file plan as `YYYY-MM-DD-short-slug/` with `PLAN.md` as the main entry point.
7. Use `phases/` inside a plan folder when the plan has distinct workstreams, stages, or nested decisions.
8. Add frontmatter with `status`, `created`, `updated`, and `project` to the plan's main file.
9. Add a `## Goal Instructions` section to the plan's main file.
10. During execution, ensure the plan status is in sync and updated.
11. Keep `INDEX.md` limited to active plans and the shortest useful context.
12. When a plan is complete, set a clear completed status, update `updated`, move the file or whole folder to `archive/`, and remove it from `INDEX.md`.
13. When a plan is obsolete, set a clear obsolete status, update `updated`, move the file or whole folder to `archive/`, and remove it from `INDEX.md`.

## Main File Metadata

```md
---
status: <current-status>
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: project-name
---
```

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

## Rules

- Do not store durable plans in repos unless the user explicitly asks.
- Do not create plan files for ordinary planning discussions. Keep those plans in chat.
- Write plans as explicit commitments. Avoid conditional or uncertain wording like `if`, `when`, `decide`, or `maybe`.
- Goal instructions are AI-facing prompts for setting the goal, not copyable `/goal` commands.
- Goal instructions should name the execution objective and success signals, not repeat the whole plan.
- Do not delete plans automatically. Archive instead.
- Do not archive ambiguous plans without asking.
- Do not force a fixed plan template. Match the plan structure to the work.
- Do not force fixed status names. Use whatever human-readable status best describes the current shape of the plan.
- Use a folder when the plan needs supporting files, options, research, screenshots, task breakdowns, or review notes.
- Use phases when one plan contains separable streams of work; keep `PLAN.md` as the orientation layer.
- Keep the plan status in sync and updated while working from a persistent plan.
- Keep phase statuses readable from the main plan or index when they matter for cleanup.
- Keep plans detailed enough to preserve every agreed point, decision, scope boundary, and verification expectation.
- Add files and sections when they carry useful context.
- Update `updated` whenever changing the plan body or status.
- Preserve historical decisions when archiving; do not rewrite old plans into summaries unless the user asks.
