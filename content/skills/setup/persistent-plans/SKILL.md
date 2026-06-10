---
name: persistent-plans
description: Persistent plan files in ~/plans/<project-name>, covering create, update, find, review, clean up, complete, archive, and mark stale plan workflows.
---

# Persistent Plans

Manage persistent plan files outside project repos.

## Workflow

1. Create or update plan files only when the user explicitly asks for a plan file.
2. Resolve the project name from the user's target repo or current working directory.
3. Use `~/plans/<project-name>/`; derive the project from the canonical repo folder, not a temporary worktree path.
4. Read `INDEX.md` before creating a new plan. To list active plans or rebuild an index, run:

```bash
plan list --project=<project-name>
plan delete --project=<project-name>
plan index --project=<project-name> --write
```

5. Create the project folder, `archive/`, and `INDEX.md` when missing.
6. Store simple plans as `YYYY-MM-DD-meaningful-slug.md`; store multi-file plans as `YYYY-MM-DD-meaningful-slug/PLAN.md` with optional `phases/`.
7. Add frontmatter with `status`, `created`, `updated`, and `project`.
8. Add `## Goal Instructions` with a concrete execution prompt and success signals.
9. Keep status and `updated` in sync while changing or executing a plan.
10. Archive completed or obsolete plans and remove them from `INDEX.md`.
11. Load `references/plan-files.md` for file layout, metadata, and goal-instruction details.

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
- Keep the plan status in sync and updated while working from a persistent plan.
- Keep plans detailed enough to preserve every agreed point, decision, scope boundary, and verification expectation.
- Preserve historical decisions when archiving; do not rewrite old plans into summaries unless the user asks.
