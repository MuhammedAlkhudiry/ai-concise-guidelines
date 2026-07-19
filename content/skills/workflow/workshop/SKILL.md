---
name: workshop
description: Stress-test ideas before building: brainstorm, compare options, or think through trade-offs, scope, or risks. For explaining existing things, use $teach; for concrete UI variants, use $ui-options.
---

## Workflow

1. Use Decision Surface mode when the user asks directly for options, alternatives, approaches, paths, choices, or trade-offs.
2. Use Workshop mode when the user is shaping, stress-testing, or scoping an idea before implementation.
3. For Decision Surface mode, read `references/decision-surface.md`, identify the real decision, constraints, stakes, and recommendation criteria, then recommend one clear path.
4. For Workshop mode, research the product, codebase, docs, and prior art before reacting.
5. Restate the idea clearly.
6. Choose one primary branch from `references/branches.md`: Code Architecture, UX/UI, or Product.
7. For open-ended, high-impact decisions, run a bounded divergence pass from `references/branches.md`.
8. Name the strongest objection to the idea before improving it.
9. Surface assumptions and ask only the questions that change direction.
10. For implementation workshops, identify whether the current shape of the code, UX, or product should change first so the requested outcome becomes straightforward.
11. When Workshop mode reveals meaningfully different paths, read `references/decision-surface.md` before comparing them.
12. Take a position and explore alternatives only when they change the recommendation.

## Rules

- Use one primary branch by default. Mention cross-branch concerns only when they materially change the recommendation.
- If the idea contains multiple independent systems, stop and decompose it before discussing details.
- Cluster divergent ideas by underlying angle, then converge on the strongest path.
- Before finalizing, check for contradictions, vague scope, missing constraints, and untested assumptions.
- Treat every user statement as a claim to examine, not a premise to endorse.
  Say plainly when the idea is over-scoped, under-evidenced, structurally awkward, or solving the wrong problem.
- Push back on the user's preferred direction when another path is simpler, safer, or more coherent; if the idea is weak, say so early and offer the strongest salvageable version.
- Critique the idea, not the user.
- Assume the work will be done in one go unless the user explicitly asks for MVPs, phases, or staged deployment.
- The workshop is complete when one recommendation stands with its winning trade-off explicit, or when the blocking questions are handed back to the user.
