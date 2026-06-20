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
12. When a completed or stale thread reveals durable agent-workflow friction, selectively run `ai-suggest-improvements` in a same-directory fork of that thread instead of appending meta-analysis to the original thread.
13. After changes, reply in the management thread with a short summary of renamed threads, archived threads, pin changes, improvement-review forks, and threads needing judgment.

## Improvement Reviews

Use this only when the thread shows reusable workflow friction such as missing docs, stale instructions, slow checks, hidden setup, repeated manual steps, brittle automation, or tool pain that would affect nearby future tasks.

Do not ask for improvement reviews by default. Most completed threads should be renamed or archived without a meta-review. Start an improvement review only when the thread has a concrete lesson likely to improve future nearby tasks.

Do not send `ai-suggest-improvements` into the original working thread unless the user explicitly asks. Fork the completed thread in the same directory, send the fork a follow-up prompt, and keep the management thread summary short. Archive the fork after its suggestion pass is complete unless the user needs to keep it visible.

When multiple improvement reviews run in one cleanup pass, summarize them as a compact aggregate: number requested, number completed, number with no meaningful suggestions, shared themes, concrete follow-ups, and any forks still pending. Do not paste each fork's full suggestion report into the management thread.

```text
Use ai-suggest-improvements for this completed session.

Review the full thread path: goals, constraints, decisions, delays, verification, and instruction gaps.
Suggest only durable repo, tooling, docs, automation, skill, or process improvements that would help future nearby agent sessions.
Do not edit files, install packages, run mutating scripts, or implement the suggestions.
If there are no meaningful improvements, say so directly.
```

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
- When a completed or stale thread reveals durable agent-workflow friction, selectively run ai-suggest-improvements in a same-directory fork of that thread instead of appending meta-analysis to the original thread; archive the fork after its suggestion pass is complete unless it should stay visible.
- After making changes, reply in this thread with a short daily summary of renamed threads, archived threads, any pin changes, compact improvement-review results, and threads that need user judgment.
```

## Rules

- Ask before making the automation more aggressive than the user requested.
- Keep stale thresholds explicit.
- Treat pinned threads as protected unless the user explicitly changes that rule.
- Use the thread-management tools for thread actions and the automation tool for schedules; do not describe unsupported hard-delete behavior as available.
