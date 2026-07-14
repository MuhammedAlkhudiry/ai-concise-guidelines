---
name: task-to-pr
description: Explicit task-to-pull-request execution in an isolated workspace, including scoped implementation, repository verification, diff review, commit and push, draft PR creation, CI monitoring, and mergeability checks.
---

# Task to PR

Use this when the user wants a task carried from request to pull request, especially when they mention a fresh clone, worktree, separate workspace, isolated checkout, verification, or PR creation.

## Workflow

1. Confirm the task, target repo, base branch, and PR destination when any of them are unclear.
2. Name the branch from the task intent and keep the change scoped to that task.
3. Create the isolated workspace. Prefer a disposable git worktree when the repository provides `WORKTREE-SETUP.md` and its setup scripts; otherwise use a fresh clone.
4. For a worktree, apply the $worktree Run branch and finish its verification before implementation.
5. Implement the change in the isolated workspace.
6. Verify with the repo's documented checks, then add focused task-specific checks when the changed behavior needs them.
7. Review the final diff for accidental churn, unrelated edits, secrets, generated artifacts, and missing tests.
8. Commit, push, and create the PR with the available GitHub publishing workflow.
9. Await PR CI, confirm required checks pass, and confirm the branch is mergeable without conflicts.
10. After the branch is safely pushed, clean and remove the disposable worktree unless the user asked to keep it.
11. Report the PR link, verification performed, CI and mergeability status, and any known follow-up risks.

## Rules

- Do not treat the task as complete until verification has run or a real blocker is reported.
- Do not reuse an existing non-clean working tree unless the user explicitly asks.
- If the PR cannot be created, still leave the branch pushed when possible and explain the exact blocker.
- If CI or mergeability cannot be confirmed, report the exact pending check, failure, conflict, or access blocker.
