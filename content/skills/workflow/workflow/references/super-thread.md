# Super Thread

Use a super thread for long-running work that needs durable continuity across compaction,
interruptions, or repeated operating cycles. Treat `.super-threads/<thread-name>.md` as the source
of continuity, not as a transcript summary.

## Workflow

1. When the user asks to set or resume a super thread, identify the thread name and locate
   `.super-threads/<thread-name>.md`.
2. If the file does not exist and the user is creating a super thread, create it from the template
   below.
3. Before continuing work in a super thread, read the continuity file and restate the current
   purpose, state, and next decision when useful.
4. Update the file only when durable purpose, roadmap, current state, decision, open question, or
   watchpoint changes.
5. After every update, read back the changed section and prune stale or over-specific details.
6. After compaction, interruption, or long inactivity, re-anchor from the file before acting.

## File Naming

- Store every super thread at `.super-threads/<thread-name>.md`.
- Use lowercase hyphen-case for `<thread-name>`, based on the user's name for the thread.
- Ask for the thread name when creating or resuming a super thread without one.
- Do not use root-level continuity files.

## Memory Rules

- Keep the file scarce: target 100 lines or fewer, with 150 lines as a hard warning point.
- Store operating context, not conversation history.
- Promote facts only when they would matter after a week, after compaction, or to a fresh agent.
- Prefer stable nouns, decisions, constraints, owners, dates, paths, commands, and current blockers.
- Do not store command output, routine todos, temporary hypotheses, emotional color, or reasoning
  traces.
- Do not silently rewrite the thread purpose, operating principles, or roadmap. Ask first when the
  change would alter the thread's direction.
- Resolve contradictions by naming the conflict, asking when needed, and recording the chosen
  decision.

## Template

```md
# Super Thread

## Purpose

## Operating Principles

## Current State

## Roadmap

## Decisions

## Open Questions

## Watchpoints

## Last Reviewed
```

## Update Shape

When updating the file, use tight bullets:

- `Current State`: what is true now and directly affects the next work cycle.
- `Roadmap`: durable direction, ordered only when sequence matters.
- `Decisions`: decision, date if known, and short reason.
- `Open Questions`: unanswered questions that block or materially change direction.
- `Watchpoints`: risks, fragile assumptions, recurring checks, or things easy to forget.
- `Last Reviewed`: absolute date and the reason for review.

## Completion

A super thread does not need a final answer that claims completion. End work with the current
status, the next useful action, and whether the continuity file was changed.
