---
name: babysit-prs
description: Pull request babysitting across repositories until every in-scope PR is merge-ready or hard-blocked, including fresh-clone checks, base sync, conflicts, CI diagnosis, fixes, and coverage reporting.
---

# Babysit PRs

Use this with $deep-work systematic mode. Do not stop at classification. Finish only when every in-scope PR is ready or hard-blocked.

## Goal

Set the working goal to make every in-scope PR merge-ready. Use goal tracking when available.

Ready means: checked in a fresh clone, on the latest base, conflict-free, required CI passing, and no draft or status blocker.

## Scope

1. Resolve the repository set from named repositories, the active-project inventory, or the current repository in that order.
2. Include drafts by default; mark rather than exclude them.
3. If the user says "my PRs", filter by author after first deciding which repositories are in scope.

## Inventory And Workspace

Prefer structured GitHub data. Use the GitHub connector when it exposes the needed live fields; otherwise inspect current `gh pr` and exit-code behavior through `gh help` before relying on it.

For each repository, collect enough live PR, ruleset, review, mergeability, and check data to prove the readiness contract.

Record total PR count per repository. Page or raise limits until complete.

Create a fresh clone for each repository before touching PR branches.
Do not use the user's existing working tree.
Process PRs one by one there, resetting cleanly to latest base before each PR.

## Per-PR Loop

For each PR, loop until ready or hard-blocked:

1. Check out the PR in the fresh clone. If it fails, record the blocker and continue.
2. Sync the PR branch with the latest base branch before judging readiness. Use `main` when it is the PR base; otherwise use `baseRefName`.
3. Mergeability: use current structured GitHub data. If stale or unknown, refresh and retry once.
4. CI status: inspect required checks first. Use structured check state rather than assuming a command exit code fully describes pending, skipped, or blocked checks.
5. Optional checks: when required checks are absent or incomplete, inspect all checks or `statusCheckRollup`.
6. Fix actionable blockers: update behind branches, resolve conflicts, repair failing CI, and rerun verification.
7. Do not leave draft final when otherwise ready. Mark ready for review, or name the missing human decision.
8. Return the clone to a clean latest-base state before starting the next PR.

## Fixing

Babysitting implies permission to update PR branches and push readiness fixes. Keep changes scoped to the current PR.

1. Prefer the current GitHub-supported update-branch operation to sync a PR branch with the latest base branch.
2. For conflicts, use the fresh clone's PR branch. Merge or rebase the base branch by repo convention, verify, then push.
3. For failing CI, inspect logs before editing. Do not rerun checks instead of diagnosing deterministic failures.
4. After any remote change, re-check mergeability and CI for that PR before moving on.

Never merge, close, force-push, change branch protection, or dismiss reviews unless the user explicitly requested that action.

## Report

Finish with a coverage report:

- Repositories checked and PR counts.
- Clone workspace used for each repository.
- PRs ready now: synced with latest base, no conflicts, required CI passing, and no merge or draft blocker.
- PRs blocked by type: conflicts, failing CI, pending CI, behind, draft, review/ruleset/merge queue, access or API uncertainty.
- Fixes performed, if any, with verification after each fix.
- Exact PRs still uncertain and the evidence needed to finish them.

Do not claim completion while any in-scope PR remains merely classified instead of ready or hard-blocked.
