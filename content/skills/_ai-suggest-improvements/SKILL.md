---
name: _ai-suggest-improvements
description: Use after a session when the user asks what they can do, stop doing, clarify, document, or change to help AI agents work better, easier, faster, or more accurately next time.
---

# AI Suggest Improvements

Reflect on the completed session and suggest practical ways the user, repo, workflow, prompts, or agent instructions could make future AI work better.

## Workflow

1. Review what happened in the session, including the goal, constraints, decisions, mistakes, delays, and verification path.
2. Call out what went wrong or made the work harder, even if it was small.
3. Separate user-side improvements from repo-side or agent-instruction improvements when that distinction matters.
4. Suggest durable changes only when they would pay off beyond this one session.
5. Keep the response natural and concrete. Do not force a template, checklist, score, or fixed section list.

## Rules

- Be candid, but keep the tone collaborative.
- Prefer specific examples from the session over generic AI-productivity advice.
- Include both "do more of this" and "avoid or clarify this earlier" when both are useful.
- Mention missing context, misleading instructions, unclear constraints, tool friction, stale docs, weak tests, slow feedback loops, or repo conventions when they affected the work.
- If a durable rule, skill, script, checklist, or `AGENTS.md` change would help, draft the exact wording or describe the smallest useful change.
- Stay read-only by default. Do not edit files unless the user explicitly asks for implementation.
- Do not invent problems just to fill the answer. If the session was smooth, say that and mention only the few highest-signal improvements.
