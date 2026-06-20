# Codex Thread Management

Use this workflow when setting up or refining Codex thread hygiene, especially scheduled cleanup of titles, archived threads, pinned threads, and daily summaries.

## Workflow

1. Confirm whether the user wants a one-off cleanup or a recurring automation.
2. For recurring cleanup that should continue the same conversation, use a heartbeat automation attached to the current thread.
3. Prefer archiving over deletion; Codex thread tools support archiving as the normal cleanup action.
4. Keep the automation prompt self-sufficient and action-oriented.
5. Inspect Codex threads broadly; do not use a fixed thread-count cap unless the tool requires one.
6. Normalize vague or low-signal titles only when the better title is obvious from the conversation.
7. Archive only unpinned threads that have been inactive for at least 7 days and whose latest messages reasonably suggest completed, stale, or no-longer-useful work.
8. Archive unpinned threads that have been inactive for at least 30 days even when completion is not obvious.
9. Never archive pinned threads.
10. Do not archive ambiguous 7-day stale threads; summarize them as needing user judgment.
11. Pin or unpin threads only when recent activity and importance make the choice obvious.
12. After changes, reply in the management thread with a short summary of renamed threads, archived threads, pin changes, and threads needing judgment.

## Default Automation Prompt

Use this shape when the user asks for active daily thread cleanup and does not need custom wording:

```text
Manage Codex threads once per day.

- Inspect Codex threads broadly; do not use a fixed thread-count cap unless the tool requires one.
- Normalize vague or low-signal thread titles into concise, useful titles when the correct title is obvious from the conversation.
- Archive unpinned threads only when they have been inactive for at least 7 days and their latest messages reasonably suggest the work is completed, stale, or no longer useful.
- Archive unpinned threads that have been inactive for at least 30 days even when completion is not obvious.
- Never archive pinned threads.
- Do not archive ambiguous threads; include them in the summary as needing user judgment instead.
- Pin or unpin threads only when the need is obvious from recent activity and thread importance.
- After making changes, reply in this thread with a short daily summary of renamed threads, archived threads, any pin changes, and threads that need user judgment.
```

## Rules

- Ask before making the automation more aggressive than the user requested.
- Keep stale thresholds explicit.
- Treat pinned threads as protected unless the user explicitly changes that rule.
- Use the thread-management tools for thread actions and the automation tool for schedules; do not describe unsupported hard-delete behavior as available.
