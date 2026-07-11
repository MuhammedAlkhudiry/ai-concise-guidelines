# Codex Management

Use this workflow when setting up or refining Codex hygiene, including scheduled thread cleanup, archived or pinned threads, daily summaries, and stale clone or worktree removal.

## Thread Workflow

1. Confirm whether the user wants a one-off cleanup or a recurring automation.
2. For recurring cleanup that should continue the same conversation, use a heartbeat automation attached to the current thread.
3. Prefer archiving over deletion; Codex thread tools support archiving as the normal cleanup action.
4. Keep the automation prompt self-sufficient and action-oriented.
5. Inspect Codex threads broadly; do not use a fixed thread-count cap unless the tool requires one.
6. Treat threads that have been inactive for at least 7 days as stale.
7. Archive stale unpinned threads even when completion is not obvious.
8. Never archive pinned threads.
9. Pin or unpin threads only when recent activity and importance make the choice obvious.
10. Do not create database or filesystem backup files during routine cleanup. Use Codex thread tools first; when a local-index fallback is unavoidable, limit it to exact known thread IDs and report the fallback.
11. Include stale Codex clone and worktree cleanup when the workflow request or automation prompt includes broader Codex management, not only thread-only cleanup.
12. After changes, reply in the management thread with a short summary of archived threads, pin changes, clone/worktree cleanup, notable durable follow-ups, and deferred archive decisions.

## Clone And Worktree Cleanup

Use this branch when the user asks to clear stale Codex clones, worktrees, temporary project checkouts, or local environments created for Codex work.

1. Identify the protected keeper checkout first. Prefer the project's active-project registry, repo instructions, or the user's explicit path. Treat that checkout as protected even if it is dirty or resource-heavy.
2. Inventory candidates before deleting anything. Search common project roots, Codex worktree roots, and temporary directories for matching repositories; include local dev environments, containers, and process managers that refer to those paths.
3. For each candidate, record path, git remote, current branch, dirty file count, size when useful, and any associated local environment name. A candidate is clean only when it is a repository for the target remote and `git status --short` has no output.
4. Present the list first unless the user already approved a specific destructive scope. Split it into protected keeper, clean candidates, and dirty candidates. Do not remove dirty candidates unless the user explicitly approves wiping dirty work.
5. Stop and delete associated local environments before deleting their files. Use the environment's native deletion command so containers, databases, volumes, sync sessions, and built images are removed with the project. If a required privilege prompt cannot be satisfied, report the leftover action.
6. Delete only approved clean candidate directories. Remove empty wrapper directories after deleting nested worktrees, but do not remove non-empty parents.
7. Re-scan the filesystem, Codex worktree roots, local environment registry, and running containers or processes. Completion requires the approved clean candidates to be absent and the protected keeper plus any dirty candidates to remain.
8. Report what was removed, what was intentionally left, any privilege-limited cleanup that remains, and whether the resource-heavy processes improved.

When cleanup is requested as `clean only`, remove only candidates that were clean at the time of approval. If new clean candidates appear during final verification, remove them only when they match the same target repository and cleanup scope.

## Default Automation Prompt

Use this shape when the user asks for active daily thread cleanup and does not need custom wording:

```text
Manage Codex threads once per day.

- Inspect Codex threads broadly; do not use a fixed thread-count cap unless the tool requires one.
- Treat threads that have been inactive for at least 7 days as stale.
- Archive stale unpinned threads even when completion is not obvious.
- Never archive pinned threads.
- Pin or unpin threads only when the need is obvious from recent activity and thread importance.
- Include stale Codex clone and worktree cleanup as part of the workflow: inventory candidates first, protect the keeper checkout, remove only clean approved candidates, and report what was removed or left.
- Do not create database or filesystem backup files during routine cleanup. Use Codex thread tools first; when a local-index fallback is unavoidable, limit it to exact known thread IDs and report the fallback.
- After making changes, reply in this thread with a short daily summary of archived threads, any pin changes, clone/worktree cleanup, notable durable follow-ups, and deferred archive decisions.
```

## Rules

- Ask before making the automation more aggressive than the user requested.
- Keep stale thresholds explicit.
- Treat pinned threads as protected unless the user explicitly changes that rule.
- Use the thread-management tools for thread actions and the automation tool for schedules; do not describe unsupported hard-delete behavior as available.
