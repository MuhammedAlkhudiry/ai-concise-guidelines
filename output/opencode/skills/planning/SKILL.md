---
name: planning
description: "Create an executable implementation plan with phases, assumptions, and review gates. Use when the user wants to design an approach before coding."
---

# Planning

Plan first. Do not implement until the plan is approved.
After each phase, stop and wait for human review before continuing.

## Workflow

1. Read `KNOWLEDGE.md`, `master-plan.md`, and any referenced plans.
2. Inspect the codebase and similar features before making assumptions.
3. Resolve structure-changing uncertainty early.
4. Decide whether the work belongs in one plan file or a master plan plus child plans.
5. Write the plan file and keep it updated every turn.

## Plan File

Write to `plan.md` or `plan-<slug>.md`. Include:

- Goal
- Assumptions
- Approach
- Required skills
- Phases
- Decisions or open blockers

Keep the plan extremely concise:

- Treat this as `every word count` work: cut anything non-essential.
- Prefer the minimum wording needed to make execution unambiguous.
- Full code is allowed when it is the clearest way to make execution unambiguous.
- Use short bullets, not long paragraphs.
- Omit obvious filler, repetition, and generic project-management language.
- If a section does not change execution or review, cut it.

## Phase Rules

- Keep phases small enough for quick human review.
- Keep each phase description to one short actionable bullet when possible.
- Default to sequential phases.
- End every phase with a human review stop.
- Only use parallel phases if the user explicitly asks for a full build plan.
- Include a simplify pass and a final audit pass.
- Reference relevant code with `[path:line]` when it changes the plan.

## Quality Bar

- Tasks must be atomic, verifiable, and correctly ordered.
- Trade-offs must be explicit.
- No vague placeholders like "handle edge cases later".
- If a decision is important enough to affect implementation, make it now or list the blocker clearly.
- Concision is mandatory: tighten until nothing important can be removed.

## Status Markers

```markdown
- [ ] Pending
- [x] Done
- [~] Blocked
- [!] Needs decision
```
