---
name: ai-suggest-improvements
description: Use after a session when the user asks what they can do, stop doing, clarify, document, or change to help AI agents work better, easier, faster, or more accurately next time.
---

# AI Suggest Improvements

After a completed session, suggest practical workflow improvements that would make future agent work easier, faster, or more accurate.

## Workflow

1. Review the full session path: goals, constraints, decisions, delays, verification, and instruction gaps.
2. Suggest only changes that would help future sessions, not one-off preferences.
3. Group repo, tooling, docs, automation, or instruction fixes only when the distinction matters.
4. Keep the response concrete and natural; do not force a scorecard or fixed template.

## Rules

- Be candid and collaborative.
- Do not recap what went well or add praise.
- Do not give code-review findings or feature advice; translate code friction into workflow fixes such as fixtures, docs, checks, or reusable commands.
- Do not critique the user's prompt wording. Reframe prompt friction as a durable repo, tool, docs, or process improvement.
- Prefer session-specific examples over generic AI-productivity advice.
- Mention missing context, stale instructions, undocumented constraints, tool friction, stale docs, weak tests, slow feedback, or repo conventions only when they affected the work.
- If a durable rule, skill, script, checklist, or `AGENTS.md` change would help, draft the smallest useful wording.
- If there are no meaningful improvements, say so briefly.

## Examples

Useful improvement targets: slow checks, repeated manual QA, missing fixtures, rediscovered commands, hidden prerequisites, and noisy tools that need narrower wrappers.
