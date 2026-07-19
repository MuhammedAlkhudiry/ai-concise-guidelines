---
name: task-to-pr
description: Explicit task-to-pull-request execution in an isolated workspace, including scoped implementation, repository verification, diff review, commit and push, draft PR creation, CI monitoring, and mergeability checks.
---

# Task to PR

Use this when the user wants a task carried from request to pull request in an active project's fixed clone lanes.

## Workflow

1. Confirm the task, target repo, base branch, and PR destination when any of them are unclear.
2. Name the branch from the task intent and keep the change scoped to that task.
3. Apply $project-lanes to confirm the current Codex project is a usable fixed lane.
4. Implement the change in the isolated workspace.
5. Apply $verification, then add focused task-specific checks when the changed behavior needs them.
6. Review the final diff for accidental churn, unrelated edits, secrets, generated artifacts, and missing tests.
7. Commit, push, and create the PR through the available GitHub capability, using its current schema or `gh help` rather than copied publishing syntax.
8. Query live PR checks and mergeability until the PR is ready or an exact blocker remains.
9. Report the PR link, verification performed, CI and mergeability status, and any known follow-up risks.

## Rules

- Do not treat the task as complete until verification has run or a real blocker is reported.
- If the PR cannot be created, still leave the branch pushed when possible and explain the exact blocker.
- If CI or mergeability cannot be confirmed, report the exact pending check, failure, conflict, or access blocker.
