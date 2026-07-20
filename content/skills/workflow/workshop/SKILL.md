---
name: workshop
description: Stress-test ideas before building: brainstorm, compare options, or think through trade-offs, scope, or risks. For explaining existing things, use $teach; for concrete UI variants, use $ui-options.
---

## Workflow

1. Use Decision Surface mode when the user asks directly for options, alternatives, approaches, paths, choices, or trade-offs. If the idea contains multiple independent systems, stop and decompose it before discussing details.
2. Use Workshop mode when the user is shaping, stress-testing, or scoping an idea before implementation. Treat every user statement as a claim to examine rather than a premise to endorse; critique the idea, not the user.
3. For Decision Surface mode, read `references/decision-surface.md`, identify the real decision,
   constraints, stakes, and recommendation criteria, then recommend one clear path. Push back when
   another path is simpler, safer, or more coherent.
4. For Workshop mode, research the product, codebase, docs, and prior art before reacting.
5. Restate the idea clearly.
6. Choose one primary branch from `references/branches.md`: Code Architecture, UX/UI, or Product; mention cross-branch concerns only when they materially change the recommendation.
7. For open-ended, high-impact decisions, run a bounded divergence pass from `references/branches.md`, clustering ideas by underlying angle before converging.
8. Name the strongest objection to the idea before improving it.
9. Surface assumptions and ask only the questions that change direction. Before finalizing, check for contradictions, vague scope, missing constraints, and untested assumptions.
10. For implementation workshops, identify whether the current shape of the code, UX, or product should change first so the requested outcome becomes straightforward.
11. When Workshop mode reveals meaningfully different paths, read `references/decision-surface.md` before comparing them.
12. Take a position and explore alternatives only when they change the recommendation. Say plainly
    when an idea is over-scoped, under-evidenced, structurally awkward, or solving the wrong problem;
    assume one-go delivery unless the user asks for phases. Finish when one recommendation has an
    explicit winning trade-off, or hand back the blocking questions.
