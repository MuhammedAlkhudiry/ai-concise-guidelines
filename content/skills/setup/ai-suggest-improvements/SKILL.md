---
name: ai-suggest-improvements
description: Use after a session when the user asks what they can do, stop doing, clarify, document, or change to help AI agents work better, easier, faster, or more accurately next time.
---

# AI Suggest Improvements

After a completed session, suggest practical workflow improvements that would make future agent work easier, faster, or more accurate across similar work.

## Workflow

1. Review the full session path: goals, constraints, decisions, delays, verification, and instruction gaps.
2. Suggest only changes that would help future agent sessions beyond the exact feature just worked on.
3. Group repo, tooling, docs, automation, or instruction fixes only when the distinction matters.
4. Keep the response concrete and natural; do not force a scorecard or fixed template.

## Rules

- Be candid and collaborative.
- Do not recap what went well or add praise.
- Do not give code-review findings or feature advice; translate code friction into workflow fixes such as fixtures, docs, checks, or reusable commands.
- Do not critique the user's prompt wording. Reframe prompt friction as a durable repo, tool, docs, or process improvement.
- Do not suggest feature-local scripts, docs, fixtures, or QA checks only because they make that feature easier; include them only when they create a reusable project workflow or agent contract.
- Before suggesting a point, ask whether it would help an agent on a different nearby task in the same repo. If not, skip it.
- Prefer session-specific examples over generic AI-productivity advice.
- Mention missing context, stale instructions, undocumented constraints, tool friction, stale docs, weak tests, slow feedback, or repo conventions only when they affected the work.
- If a durable rule, skill, script, or checklist change would help, draft the smallest useful wording and suggest the right follow-up skill or file.
- Never edit files, install packages, run scripts that mutate state, or implement the suggestion from this skill.
- If there are no meaningful improvements, say so directly.

## Examples

Useful improvement targets: slow checks, repeated manual QA, missing fixtures, rediscovered commands, hidden prerequisites, and noisy tools that need narrower wrappers.
