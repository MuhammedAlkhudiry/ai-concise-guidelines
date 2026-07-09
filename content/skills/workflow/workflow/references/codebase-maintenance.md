# Codebase Maintenance

Run a substantial maintenance pass from an isolated clone. Leave a reviewable draft PR, create requested automation, and update maintenance state. Treat database work as codebase health, not a separate branch.

## Simple Prompt

```text
Use /workflow codebase-maintenance to set up the recurring automation, run a substantial maintenance
pass from a fresh clone, and create a draft PR if reviewable changes are found.
```

## Workflow

1. Establish scope: repo, base branch, explicit automation request, project rules, checks, and PR destination.
2. If automation was requested, create or update the recurring automation as a concrete artifact before the run is done.
3. Read the maintenance state file before choosing work.
4. Create a fresh clone for edits and PR work. Do not edit the user's existing checkout unless they explicitly ask for local-only work.
5. Inspect deeply before changing: product/domain flows, core modules, callers, data model, tests,
   runtime paths, recent failures, type/lint/build checks, dependency drift,
   brittle code, migrations, schema constraints, indexes, ORM models, query builders, fixtures, jobs,
   and developer workflow friction.
6. Select one substantial maintenance pack: one coherent improvement or tightly related fixes with clear evidence and local verification.
7. Apply the safety, substance, and depth gates before editing.
8. Implement the selected pack only, including the maintenance state update.
9. Verify with targeted checks first, then broader checks when the changed surface justifies them.
10. Commit, push, and create a draft PR when changes were made and verification passed.
11. If no substantial pack is found, report the top candidates, why they were skipped, and what would unblock them.

Completion requires every requested outcome: automation configured when requested, edits made from a fresh clone, state updated when a PR opens, a draft PR for verified changes, or a no-change report explaining why no substantial pack was available.

## Maintenance State

Use a source-controlled state file so future runs do not repeat shallow fixes or rejected ideas. Default to repo-root `.codex/codebase-maintenance.md` unless repo rules prescribe another path.

Before selecting work, read the state file when it exists. If it does not exist, create it in the first PR that
changes code. Track:

- Date, branch, PR, and status for completed maintenance packs.
- Areas recently inspected and what was already improved.
- Rejected or closed ideas with the reason.
- Promising deep targets for future runs.
- Repeatedly skipped infra/tooling chores so they do not crowd out product code.

Update the state file in every maintenance PR. If no PR is created, include the intended state update in the
no-change report and say that it was not persisted.

## Depth Gate

Do not default to infrastructure, config, formatting, generated artifacts, dependency chores, logging polish, or developer workflow fixes just because they are safest. They are valid only after deeper product, business, data, or architecture inspection shows they are still the best pack.

Each run should inspect at least one real application flow or core module before selecting work. Prefer changes
that improve correctness, maintainability, domain modeling, state handling, data access, testability, or user-facing
behavior. It is acceptable to open a bold draft PR that might be rejected when the evidence, rollback path, and
review notes are clear.

## Substance Gate

A normal maintenance PR should be meaningful, not a one-line cleanup. Target at least 100 meaningful changed
lines across source, tests, fixtures, migrations, docs, or tooling. Small fixes must be folded into a related
maintenance pack instead of ending the run.

Do not pad a diff to hit the line target. If the only safe work is tiny, keep inspecting for related fixes.
Stop with a no-change report when no substantial, coherent pack exists.

Allow a smaller PR only when the user explicitly asked for a narrow fix, or the issue is urgent, high-risk,
or blocks the requested automation/PR setup itself.

## Safety Gate

Proceed automatically only when all are true:

- The issue has concrete evidence from code, tests, logs, docs, dependencies, or read-only runtime data.
- The fix is bounded enough to review comfortably in one PR.
- The behavior can be verified locally or through approved read-only checks.
- The change does not require a product decision, credential change, production write,
  destructive command, irreversible migration, risky data backfill, or live maintenance operation.

Stop and report when the strongest candidate needs human approval, production access beyond approved read-only paths, broad architecture direction, ambiguous data migration strategy, or planned project work.

Safe means safe to execute and review, not guaranteed to be accepted. A bold PR may change structure, tests, or domain code when it is reversible, well explained, and locally verified.

## Automation Setup

When the request mentions a cadence such as daily, weekly, recurring, scheduled, monitor, or automation,
use the available automation tool. Inspect existing automations first and update a matching one instead of
creating a duplicate. The automation prompt must instruct future runs to use this workflow, create a fresh
clone, seek a substantial maintenance pack, verify, open a draft PR for reviewable changes, and update
the maintenance state file.

Create or update an actual automation record; do not merely describe the automation, paste a prompt,
or mention it in the PR. The automation setup is complete only when these details are known:

- Name or id.
- Cadence or schedule.
- Target repo or cwd.
- Execution mode and destination when the automation tool exposes them.
- Active or paused status.
- Prompt that explicitly names `/workflow codebase-maintenance`, fresh clone, substantial pack, verification,
  and draft PR behavior.

Do not finish a scheduled setup request after only making a local change. Report the automation details
separately from the PR summary.

## Database Surface

Include database concerns in the same maintenance pass. Inspect migrations, schema dumps, models,
relationships, query builders, reports, seeders, fixtures, indexes, constraints, slow-query evidence,
and explain plans when relevant.

Do not run production writes, destructive SQL, schema changes, seeders, or maintenance commands.
Implement database work only as reviewable source changes with local verification, such as migrations,
model/query updates, tests, fixtures, or documented read-only checks.

## Pull Request Handoff

Use the task-to-PR pattern: fresh clone, branch, scoped commit, push, draft PR, then CI or mergeability check
when available. Keep the PR coherent and reviewable, but do not stop at a token-sized fix.

Include:

- What changed and why.
- Evidence that made the fix worth doing.
- Checks run and their results.
- PR link, branch, commit, and CI or mergeability status when available.
- Manual QA steps and basic test cases.
- Risks, skipped candidates, and follow-up work.

Do not create a PR for speculative cleanups, failed verification, or investigation-only work.

## Automation Prompt

Use this prompt for scheduled runs:

```text
Use /workflow codebase-maintenance for this repository.

If this is a scheduled setup request, create or update the recurring automation as an actual automation
record. Report its name or id, cadence, target repo or cwd, execution mode, destination, prompt summary,
and active or paused status.

Read repo-root `.codex/codebase-maintenance.md` if it exists. Use it to avoid repeating completed,
rejected, or recently inspected improvements.

Run a substantial maintenance pass from a fresh clone on the default branch. Inspect at least one real
application flow or core module before selecting work. Include code, tests, dependencies, workflow,
migrations, schema, indexes, models, query paths, fixtures, jobs, and recent failure signals.

Select one reviewable maintenance pack only. Prefer at least 100 meaningful changed lines across related
source, tests, fixtures, migrations, docs, or tooling. Fold tiny fixes into a coherent related pack.
Do not pad the diff. Prefer product/domain/codebase improvements over infra polish unless the deeper
inspection shows infra is the best pack. A bold draft PR is acceptable even if it may be rejected,
as long as it is reversible, well explained, and locally verified. If no substantial pack exists,
write a no-change report.

Do not run production writes, destructive commands, live maintenance operations, risky backfills, or
irreversible migrations. If the best candidate needs approval or design work, write a no-change report.

If changes are made and verification passes, commit, push, and open a draft PR with the summary,
evidence, verification, manual QA steps, risks, skipped candidates, branch, commit, and CI status.
Update `.codex/codebase-maintenance.md` in the PR with completed work, inspected areas, rejected ideas,
and future deep targets. If no PR is created, include the intended state update in the report.
Do not finish with only a local edit when automation or PR creation was requested.
```
