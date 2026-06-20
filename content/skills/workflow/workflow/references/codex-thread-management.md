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
12. Automatically run `ai-suggest-improvements` for qualifying completed or stale work threads that reveal durable agent-workflow friction; fork each target thread in the same directory and do not append meta-analysis to the original target thread.
13. After changes, reply in the management thread with a short summary of renamed threads, archived threads, pin changes, aggregate improvement-review results, and threads needing judgment.

## Improvement Reviews

Use this only when the thread shows reusable workflow friction such as missing docs, stale instructions, slow checks, hidden setup, repeated manual steps, brittle automation, or tool pain that would affect nearby future tasks.

Do not run improvement reviews for every completed or archived thread. Most completed threads should be renamed or archived without a meta-review. Once a thread shows a concrete lesson likely to improve future nearby tasks, the review should be automatic rather than needing user approval.

Age alone is not a review signal. Trivial threads such as greetings, simple list commands, one-off title normalization runs, or age-only archive candidates should not get an improvement fork.

Do not review the management thread itself unless the user explicitly asks. The targets are the completed or stale work threads found during cleanup.

For each qualifying target thread, fork that target in the same directory, send the fork the follow-up prompt, wait for all review forks to finish, and archive completed review forks unless the user needs to keep them visible.

Cap automatic improvement reviews at 5 target threads per cleanup run. Prefer the highest-signal threads: repeated tool failures, stale or missing instructions, hidden setup, slow/noisy checks, brittle automation, or repeated manual steps.

Summarize improvement reviews as a compact aggregate: number requested, number completed, number with no meaningful suggestions, shared themes, concrete follow-ups, and any forks still pending or failed. Do not paste each fork's full suggestion report into the management thread.

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
- Automatically run ai-suggest-improvements for up to 5 qualifying completed or stale work threads that reveal durable agent-workflow friction; fork each target thread in the same directory, wait for all review forks, aggregate the results, and archive completed review forks unless they should stay visible.
- After making changes, reply in this thread with a short daily summary of renamed threads, archived threads, any pin changes, aggregate improvement-review results, and threads that need user judgment.
```

## Rules

- Ask before making the automation more aggressive than the user requested.
- Keep stale thresholds explicit.
- Treat pinned threads as protected unless the user explicitly changes that rule.
- Use the thread-management tools for thread actions and the automation tool for schedules; do not describe unsupported hard-delete behavior as available.
