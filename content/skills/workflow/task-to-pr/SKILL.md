---
name: task-to-pr
description: End-to-end task delivery in an isolated workspace. Use when the user asks to handle, implement, fix, or finish a task in a fresh clone, worktree, or separate checkout and then verify, commit, push, and open a pull request.
---

# Task to PR

Use this when the user wants a task carried from request to pull request, especially when they mention a fresh clone, separate workspace, isolated checkout, verification, or PR creation.

## Workflow

1. Confirm the task, target repo, base branch, and PR destination when any of them are unclear.
2. Create an isolated workspace. Prefer `git worktree` from the existing checkout; use a fresh clone only when worktrees are unavailable or the user asks for a clone.
3. Name the branch from the task intent and keep the change scoped to that task.
4. Implement the change in the isolated workspace.
5. Verify with the repo's documented checks, then add focused task-specific checks when the changed behavior needs them.
6. Review the final diff for accidental churn, unrelated edits, secrets, generated artifacts, and missing tests.
7. Commit, push, and create the PR. Use `git-branch-mr` when available for branch, commit, push, and PR packaging.
8. Report the PR link, verification performed, and any known follow-up risks.

## Rules

- Do not treat the task as complete until verification has run or a real blocker is reported.
- Do not reuse an existing non-clean working tree unless the user explicitly asks.
- If the PR cannot be created, still leave the branch pushed when possible and explain the exact blocker.
