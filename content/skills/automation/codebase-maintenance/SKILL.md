---
name: codebase-maintenance
description: Scheduled or explicit codebase maintenance runs that inspect, fix, verify, and prepare PRs for safe repo health across code, tests, dependencies, workflow, and database source changes.
---

# Codebase Maintenance

Run a bounded maintenance pass that leaves a reviewable pull request or concise no-change report.
Treat database work as codebase health, not a separate branch.

## Workflow

1. Establish scope: repo, base branch, schedule context, project rules, current diffs, checks, and PR expectations.
2. Inspect broadly before changing: recent failures, tests, type/lint/build checks, dependency drift,
   brittle code, migrations, schema constraints, indexes, ORM models, query builders, fixtures, jobs,
   and developer workflow friction.
3. Select one maintenance pack: a single fix or tightly related fixes with clear evidence, local verification, and low review burden.
4. Apply the safety gate before editing.
5. Implement the selected pack only.
6. Verify with targeted checks first, then broader checks when the changed surface justifies them.
7. If changes were made, prepare a PR handoff with summary, evidence, verification, risk, rollback notes, and step-by-step QA.
8. If no safe change is found, report the top candidates, why they were skipped, and what would unblock them.

## Safety Gate

Proceed automatically only when all are true:

- The issue has concrete evidence from code, tests, logs, docs, dependencies, or read-only runtime data.
- The fix is bounded enough to review comfortably in one PR.
- The behavior can be verified locally or through approved read-only checks.
- The change does not require a product decision, credential change, production write,
  destructive command, irreversible migration, risky data backfill, or live maintenance operation.

Stop and report when the strongest candidate needs human approval, production access beyond approved
read-only paths, broad architecture direction, ambiguous data migration strategy, or planned project work.

## Database Surface

Include database concerns in the same maintenance pass. Inspect migrations, schema dumps, models,
relationships, query builders, reports, seeders, fixtures, indexes, constraints, slow-query evidence,
and explain plans when relevant.

Do not run production writes, destructive SQL, schema changes, seeders, or maintenance commands.
Implement database work only as reviewable source changes with local verification, such as migrations,
model/query updates, tests, fixtures, or documented read-only checks.

## Pull Request Handoff

For scheduled runs, prefer a draft PR when safe changes were made and verification passed.
Keep the PR small and easy to review.

Include:

- What changed and why.
- Evidence that made the fix worth doing.
- Checks run and their results.
- Manual QA steps and basic test cases.
- Risks, skipped candidates, and follow-up work.

Do not create a PR for speculative cleanups, failed verification, or investigation-only work.

## Automation Prompt

Use this prompt for scheduled runs:

```text
Use $codebase-maintenance for this repository.

Run a bounded maintenance pass on the default branch. Inspect code, tests, dependencies, workflow,
migrations, schema, indexes, models, query paths, fixtures, jobs, and recent failure signals.

Select one safe maintenance pack only. Implement it only when the evidence is concrete, the fix is
small enough for one reviewable PR, and the result can be verified locally or through approved
read-only checks.

Do not run production writes, destructive commands, live maintenance operations, risky backfills, or
irreversible migrations. If the best candidate needs approval or design work, write a no-change report.

If changes are made and verification passes, prepare a draft PR with the summary, evidence,
verification, manual QA steps, risks, and skipped candidates. If no safe change is found, report the
top candidates and what would unblock them.
```
