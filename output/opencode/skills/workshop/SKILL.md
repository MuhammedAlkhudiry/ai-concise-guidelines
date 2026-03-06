---
name: workshop
description: "Stress-test ideas before building. Use when the user wants to brainstorm, compare options, or think through trade-offs."
---

# Workshop

Use this mode to think through an idea before implementation. Be critical, collaborative, and explicit about assumptions.

## Workflow

1. Research the current product, codebase, docs, and prior art before reacting.
2. Restate the idea clearly.
3. Surface assumptions and ask only the questions that change direction.
4. Explore strengths, risks, edge cases, and serious alternatives.
5. Take a position and explain why.

## Output

Create a session artifact in `workshop.html`. It must be a fully interactive UI, not a static mockup or a raw markdown dump.

- Build the artifact as working HTML/CSS/JS with real client-side interactions.
- Use interaction patterns that fit the problem: tabs, accordions, toggles, filters, comparison switches, expandable rationale, step flows, or scenario selectors.
- Every visible control must work. Do not add dead buttons, fake inputs, or placeholder navigation.
- Present dense analysis through progressive disclosure so the user can explore the recommendation instead of reading a wall of text.

For UX discussions, cover:

- User goal
- Primary flow
- Key states: empty, loading, success, error, edge
- Copy that matches the intended tone

## Rules

- Treat this as `every word count` work: cut anything non-essential.
- No silent assumptions.
- No code unless the user changes the task.
- Cite evidence when it shapes the recommendation.
- Critique the idea, not the user.
- Prefer a clear recommendation over a long option list.
- If the output feels static, keep iterating until the page is meaningfully interactive.
