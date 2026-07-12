---
name: task-to-pr
description: Explicit task-to-pull-request execution in an isolated clone, including scoped implementation, repository verification, diff review, commit and push, draft PR creation, CI monitoring, and mergeability checks.
---

# Task to PR

Use this when the user wants a task carried from request to pull request, especially when they mention a fresh clone, separate workspace, isolated checkout, verification, or PR creation.

## Workflow

1. Confirm the task, target repo, base branch, and PR destination when any of them are unclear.
2. Create the isolated workspace by cloning the target repo into a new directory.
3. Name the branch from the task intent and keep the change scoped to that task.
4. Implement the change in the isolated workspace.
5. Verify with the repo's documented checks, then add focused task-specific checks when the changed behavior needs them.
6. Review the final diff for accidental churn, unrelated edits, secrets, generated artifacts, and missing tests.
7. Commit, push, and create the PR with the available GitHub publishing workflow.
8. Await PR CI, confirm required checks pass, and confirm the branch is mergeable without conflicts.
9. Report the PR link, verification performed, CI and mergeability status, and any known follow-up risks.

## Rules

- Do not treat the task as complete until verification has run or a real blocker is reported.
- Do not use `git worktree` for this workflow unless the user explicitly asks for a worktree.
- Do not reuse an existing non-clean working tree unless the user explicitly asks.
- If the PR cannot be created, still leave the branch pushed when possible and explain the exact blocker.
- If CI or mergeability cannot be confirmed, report the exact pending check, failure, conflict, or access blocker.
