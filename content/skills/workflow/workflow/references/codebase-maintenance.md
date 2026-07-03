# Codebase Maintenance

Run a substantial maintenance pass from an isolated clone that leaves a reviewable draft PR,
an active scheduled automation when requested, or a concise no-change report. Treat database work
as codebase health, not a separate branch.

## Simple Prompt

```text
Use /workflow codebase-maintenance to set up the recurring automation, run a substantial maintenance
pass from a fresh clone, and create a draft PR if safe fixes are found.
```

## Workflow

1. Establish scope: repo, base branch, schedule request, project rules, checks, and PR destination.
2. If the user asked for a schedule, create or update the recurring automation before the run is done.
3. Create a fresh clone for edits and PR work. Do not edit the user's existing checkout unless they explicitly ask for local-only work.
4. Inspect broadly before changing: recent failures, tests, type/lint/build checks, dependency drift,
   brittle code, migrations, schema constraints, indexes, ORM models, query builders, fixtures, jobs,
   and developer workflow friction.
5. Select one substantial maintenance pack: one coherent improvement or tightly related fixes with clear evidence, local verification, and low review burden.
6. Apply the safety and substance gates before editing.
7. Implement the selected pack only.
8. Verify with targeted checks first, then broader checks when the changed surface justifies them.
9. Commit, push, and create a draft PR when changes were made and verification passed.
10. If no safe substantial pack is found, report the top candidates, why they were skipped, and what would unblock them.

Completion requires all requested outcomes: automation configured when requested, fresh clone used for changes,
draft PR opened for verified changes, or a no-change report explaining why no substantial safe pack was available.

## Substance Gate

A normal maintenance PR should be meaningful, not a one-line cleanup. Target at least 100 meaningful changed
lines across source, tests, fixtures, migrations, docs, or tooling. Small fixes must be folded into a related
maintenance pack instead of ending the run.

Do not pad a diff to hit the line target. If the only safe work is tiny, keep inspecting for related fixes.
Stop with a no-change report when no substantial, coherent, safe pack exists.

Allow a smaller PR only when the user explicitly asked for a narrow fix, or the issue is urgent, high-risk,
or blocks the requested automation/PR setup itself.

## Safety Gate

Proceed automatically only when all are true:

- The issue has concrete evidence from code, tests, logs, docs, dependencies, or read-only runtime data.
- The fix is bounded enough to review comfortably in one PR.
- The behavior can be verified locally or through approved read-only checks.
- The change does not require a product decision, credential change, production write,
  destructive command, irreversible migration, risky data backfill, or live maintenance operation.

Stop and report when the strongest candidate needs human approval, production access beyond approved
read-only paths, broad architecture direction, ambiguous data migration strategy, or planned project work.

## Automation Setup

When the request mentions a cadence such as daily, weekly, recurring, scheduled, monitor, or automation,
use the available automation tool. Inspect existing automations first and update a matching one instead of
creating a duplicate. The automation prompt must instruct future runs to use this workflow, create a fresh
clone, seek a substantial maintenance pack, verify, and open a draft PR for safe changes.

Do not finish a scheduled setup request after only making a local change. Report the automation name or id,
schedule, target repo, and whether it is active.

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

If this is a scheduled setup request, create or update the recurring automation first and report its
name, cadence, target repo, and active status.

Run a substantial maintenance pass from a fresh clone on the default branch. Inspect code, tests,
dependencies, workflow, migrations, schema, indexes, models, query paths, fixtures, jobs, and recent
failure signals.

Select one safe maintenance pack only. Prefer at least 100 meaningful changed lines across related
source, tests, fixtures, migrations, docs, or tooling. Fold tiny fixes into a coherent related pack.
Do not pad the diff. If no substantial safe pack exists, write a no-change report.

Do not run production writes, destructive commands, live maintenance operations, risky backfills, or
irreversible migrations. If the best candidate needs approval or design work, write a no-change report.

If changes are made and verification passes, commit, push, and open a draft PR with the summary,
evidence, verification, manual QA steps, risks, skipped candidates, branch, commit, and CI status.
Do not finish with only a local edit when automation or PR creation was requested.
```
