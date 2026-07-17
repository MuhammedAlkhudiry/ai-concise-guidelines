---
name: task-to-pr
description: Explicit task-to-pull-request execution in an isolated workspace, including scoped implementation, repository verification, diff review, commit and push, draft PR creation, CI monitoring, and mergeability checks.
---

# Task to PR

Use this when the user wants a task carried from request to pull request in an active project's fixed clone lanes.

## Workflow

1. Confirm the task, target repo, base branch, and PR destination when any of them are unclear.
2. Name the branch from the task intent and keep the change scoped to that task.
3. Apply $project-lanes to acquire a ready lane for the task branch; refuse the task when no lane is ready.
4. Finish lane verification before implementation.
5. Implement the change in the isolated workspace.
6. Verify with the repo's documented checks, then add focused task-specific checks when the changed behavior needs them.
7. Review the final diff for accidental churn, unrelated edits, secrets, generated artifacts, and missing tests.
8. Commit, push, and create the PR with the available GitHub publishing workflow.
9. Await PR CI, confirm required checks pass, and confirm the branch is mergeable without conflicts.
10. After the branch is safely pushed and the immediate workflow is complete, release the lane through $project-lanes.
11. Report the PR link, verification performed, CI and mergeability status, and any known follow-up risks.

## Rules

- Do not treat the task as complete until verification has run or a real blocker is reported.
- Do not bypass lane acquisition or use an active project's main clone.
- If the PR cannot be created, still leave the branch pushed when possible and explain the exact blocker.
- If CI or mergeability cannot be confirmed, report the exact pending check, failure, conflict, or access blocker.
