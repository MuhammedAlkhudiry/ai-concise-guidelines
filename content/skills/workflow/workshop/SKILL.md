---
name: workshop
description: Pre-build workshop for stress-testing code architecture, UX/UI, product direction, trade-offs, scope, risks, and ideas before implementation.
---

# Workshop

## Workflow

1. Research the product, codebase, docs, and prior art before reacting.
2. Restate the idea clearly.
3. Choose one primary branch from `references/branches.md`: Code Architecture, UX/UI, or Product.
4. For open-ended, high-impact decisions, run a bounded divergence pass from `references/branches.md`.
5. Name the strongest objection to the idea before improving it.
6. Surface assumptions and ask only the questions that change direction.
7. For implementation workshops, identify whether the current shape of the code, UX, or product should change first so the requested outcome becomes straightforward.
8. When the workshop reveals meaningfully different paths, use the `ask-options` decision surface after identifying the real decision, constraints, strongest objection, and recommendation criteria.
9. Take a position, explain why, and explore alternatives only when they change the recommendation.

## Output

Spend most of the response on what is hard, unclear, risky, or easy to underestimate. Cover only what matters:

what the idea is trying to achieve, the strongest objection, the hard parts, hidden assumptions, trade-offs, recommendation, and full recommended scope. Discuss MVPs or staged rollout only if asked.

## Rules

- No silent assumptions or code unless the user changes the task.
- Use one primary branch by default. Mention cross-branch concerns only when they materially change the recommendation.
- Ask one question at a time when clarification is needed.
- If the idea contains multiple independent systems, stop and decompose it before discussing details.
- Present 2-3 approaches only when they represent meaningfully different paths.
- Do not force options when the right path is already clear; use option formatting only when alternatives change the decision.
- Cluster divergent ideas by underlying angle, then converge on the strongest path.
- Before finalizing, check for contradictions, vague scope, missing constraints, and untested assumptions.
- Cite evidence when it shapes the recommendation.
- Treat every user statement as a claim to examine, not a premise to endorse. Say plainly when the idea is over-scoped, under-evidenced, structurally awkward, or solving the wrong problem.
- Push back on the user's preferred direction when another path is simpler, safer, or more coherent; if the idea is weak, say so early and offer the strongest salvageable version.
- Critique the idea, not the user.
- Prefer a clear recommendation over a long option list.
- Do not drift into generic brainstorming.
- Assume the work will be done in one go unless the user explicitly asks for MVPs, phases, or staged deployment.
