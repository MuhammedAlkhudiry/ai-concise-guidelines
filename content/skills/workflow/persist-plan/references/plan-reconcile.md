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
2. Inventory active plans by status: `draft`, `approved`, and `done`.
3. Triage each plan before deep inspection:
   - `execute-ready`: current enough to run.
   - `needs-refresh`: useful plan, but context, scope, paths, commands, or acceptance criteria are stale or weak.
   - `needs-code-audit`: plan depends on files, APIs, schemas, tests, product flows, or external contracts that must be compared with current code.
   - `needs-user-decision`: intent, ownership, trade-off, or scope cannot be resolved from local evidence.
   - `archive-candidate`: obsolete, superseded, already done elsewhere, or no longer worth preserving as active work.
4. For `needs-code-audit` plans, inspect the plan's named files, commands, tests, routes, schemas, generated artifacts, and nearby source needed to verify its assumptions.
5. Compare the plan with current code before editing it:
   - Are referenced files, symbols, commands, routes, and tests still real?
   - Does the proposed sequence still match the current architecture and local patterns?
   - Are acceptance criteria still observable and sufficient?
   - Are verification steps still the cheapest honest signal?
   - Has the work already been completed, made obsolete, or split into a better shape?
6. Mutate plan files only when the user asked to update, fix, reconcile, refresh, polish, archive, or otherwise change persisted plans.
7. After each mutation, read back the changed section or whole plan.
8. Refresh the project index after adding, archiving, renaming, or materially changing active plans:

```bash
plan index --project=<project-name> --write
```

## Status Handling

For `draft` plans:

- Keep them short unless the user is approving them.
- Improve the shape, open questions, constraints, and evidence.
- Do not expand them into execution contracts without approval.

For `approved` plans:

- Preserve detailed execution content that is still correct.
- Refresh stale context, file paths, commands, scope, and verification steps.
- Add or update a drift check when source files are load-bearing.
- If the plan is no longer valid, set `status: draft`, update `updated`, explain why in the plan, and revise the incorrect parts.

For `done` plans:

- Leave them alone unless there is a cheap reason to spot-check acceptance criteria or the user asked for cleanup.
- Move them toward archive only when they no longer need to appear in active planning.

For archive candidates:

- Archive only when the context is clear or the user asked for archiving.
- Otherwise report the archive recommendation and the evidence.

## Plan Improvements

Improve plans for execution quality, not decorative polish.

Useful improvements include:

- Stronger goal and scope boundaries.
- Current file paths, commands, symbols, routes, schemas, and tests.
- Concrete context that a fresh executor needs.
- Sequenced implementation steps with verification after meaningful steps.
- Acceptance criteria tied to observable behavior.
- Explicit out-of-scope work where scope creep is likely.
- Notes about drift, false assumptions, blockers, or user decisions.

Avoid:

- Rewriting plans only for style.
- Deep-auditing drafts whose intent is still unclear.
- Keeping obsolete work active because it can be made to look tidy.
- Turning every plan into an approved-plan template.

## Output

For one project, return:

- Plans updated, with paths and changed sections.
- Plans still valid.
- Plans needing user decisions.
- Archive candidates.
- Verification or code-audit evidence used.

For all projects, group the same result by project and include a short aggregate count.
