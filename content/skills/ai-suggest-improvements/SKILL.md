---
name: ai-suggest-improvements
description: Use after a session when the user asks what they can do, stop doing, clarify, document, or change to help AI agents work better, easier, faster, or more accurately next time.
---

# AI Suggest Improvements

Reflect on the completed session and suggest practical workflow improvements that could make future AI work better.

## Workflow

1. Review workflow-relevant parts of the full completed work, not just the last few turns: goals, constraints, handoffs, decisions, mistakes, delays, verification path, and instruction gaps.
2. Call out only what could be improved, changed, clarified, documented, or avoided next time.
3. Separate user-side workflow improvements from repo-side or agent-instruction improvements when that distinction matters.
4. Suggest durable changes only when they would pay off beyond this one session.
5. Keep the response natural, concrete, and bullet-pointed. Do not force a template, checklist, score, or fixed section list.

## Rules

- Be candid, but keep the tone collaborative.
- Do not praise the user, recap what went well, or include a positive retrospective section.
- Focus on workflow, prompts, instructions, documentation, tools, verification loops, and handoffs; avoid code-review feedback or feature-specific implementation advice unless it exposes a reusable workflow issue.
- Prefer specific workflow examples from the session over generic AI-productivity advice.
- Be specific about operational friction and possible workflow fixes.
- Mention missing context, misleading instructions, unclear constraints, tool friction, stale docs, weak tests, slow feedback loops, or repo conventions when they affected the work.
- If a durable rule, skill, script, checklist, or `AGENTS.md` change would help, draft the exact wording or describe the smallest useful change.
- Stay read-only by default. Do not edit files unless the user explicitly asks for implementation.
- Do not invent problems just to fill the answer. If there are no meaningful improvements, say that briefly instead of adding praise.

## Examples

Use examples like these as prompts for thinking, not as limits:

- Slow tools or commands that made feedback loops drag.
- Too many manual steps for a repeated task or QA path.
- Missing seeders, scripts, fixtures, templates, or checklists that would reduce repeated work.
- Rediscovering the same command, file path, or convention several times; that belongs in `AGENTS.md`, `CHECKLIST.md`, or a small runbook.
- Hidden prerequisites such as env vars, login state, VPN, running services, or seeded data.
- Noisy tool output that needed a narrower command, filter, or preflight check.
