# Plan Reconciliation

Use this when existing durable plans need to be audited, refreshed, improved, or compared with current code.

Reconciliation is lifecycle work, not general advice. Triage every relevant plan, but only perform deep code inspection where the plan depends on current implementation details.

## Scope

Default to the current project:

```bash
plan list --project=<project-name>
```

When the user asks for all projects, inspect each direct project folder under `~/plans/`. Use each project's `INDEX.md` as the entry point when it exists, then fall back to the active files in that project folder.

Do not assume the helper CLI has an all-project command. All-project reconciliation is an agent workflow over `~/plans/*`.

## Workflow

1. Read the relevant `INDEX.md` file or files first.
2. Inventory active and archived plans by location.
3. Triage each plan before deep inspection:
   - `execute-ready`: current enough to run.
   - `needs-refresh`: useful plan, but context, scope, paths, or commands are stale or weak.
   - `needs-code-audit`: plan depends on files, APIs, schemas, tests, product flows, or external contracts that must be compared with current code.
   - `needs-user-decision`: intent, ownership, trade-off, or scope cannot be resolved from local evidence.
   - `archive-candidate`: obsolete, superseded, completed elsewhere, or no longer worth preserving as active work.
4. For `needs-code-audit` plans, inspect the plan's named files, commands, tests, routes, schemas, generated artifacts, and nearby source needed to check its assumptions.
5. Compare the plan with current code before editing it:
   - Are referenced files, symbols, commands, routes, and tests still real?
   - Does the proposed sequence still match the current architecture and local patterns?
   - Has the work already been completed, made obsolete, or split into a better shape?
6. Mutate plan files only when the user asked to update, fix, reconcile, refresh, polish, archive, or otherwise change persisted plans.
7. For `needs-user-decision` plans, ask the user before editing the plan. Do not write unresolved questions into the plan as a substitute for a decision.
8. After each mutation, read back the changed section or whole plan.
9. Refresh the project index after adding, archiving, renaming, or materially changing active plans:

```bash
plan index --project=<project-name> --write
```

## Plan Handling

For active plans:

- Keep them short.
- Omit optional sections that do not add signal.
- Improve the product decisions, technical decisions, migration steps, implementation steps, verification steps, QA steps, and updates once decision-blocking questions are answered.
- Preserve execution content that is still correct and concise.
- Preserve concise user stories, UX decisions, data model decisions, architecture decisions, ordered implementation, migration/backfill steps, verification, manual QA, and dated updates when they define the intended change.
- Refresh stale context, file paths, commands, and scope only where they are needed for execution.
- If the plan is no longer valid, update `updated`, explain why in the plan, and revise the incorrect parts.

For archived plans:

- Leave them alone unless the user asked for cleanup.

For archive candidates:

- Archive only when the context is clear or the user asked for archiving.
- Otherwise report the archive recommendation and the evidence.

## Plan Improvements

Improve plans for execution quality, not decorative polish. Keep improvements short.

Useful improvements include:

- Stronger goal and scope boundaries.
- Concise product decisions, data model decisions, architecture decisions, ordered implementation, migration/backfill steps, verification, manual QA, and dated updates.
- Current file paths, commands, symbols, routes, schemas, and tests only when the plan depends on them.
- Blockers or user decisions.

## Output

For one project, return:

- Plans updated, with paths and changed sections.
- Plans still valid.
- Plans needing user decisions.
- Archive candidates.
- Code-audit evidence used.

For all projects, group the same result by project and include a short aggregate count.
