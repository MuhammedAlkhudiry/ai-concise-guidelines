---
name: workshop
description: "Stress-test ideas before building. Use when the user wants to think through code architecture, UX/UI, or product direction before implementation."
---

# Workshop

Stress-test an idea before implementation.

## Workflow

1. Research the current product, codebase, docs, and prior art before reacting.
2. Restate the idea clearly.
3. Choose one primary branch from `references/branches.md`: Code Architecture, UX/UI, or Product.
4. For open-ended, high-impact decisions, run a bounded divergence pass from `references/branches.md`.
5. Surface assumptions and ask only the questions that change direction.
6. For implementation workshops, identify whether the current shape of the code, UX, or product should change first so the requested outcome becomes straightforward.
7. Explore alternatives only when they change the recommendation.
8. Take a position and explain why.

## Output

Respond in normal discussion format, not HTML and not a generated artifact.

Spend most of the response on what is genuinely hard, unclear, risky, or easy to underestimate. Cover only what matters:

- What the idea is trying to achieve
- The hardest parts and why they are hard
- Hidden assumptions or constraints
- Important trade-offs
- A recommendation
- The full recommended scope by default. Discuss MVPs or staged rollout only if the user asks.

## Rules

- No silent assumptions.
- No code unless the user changes the task.
- Use one primary branch by default. Mention cross-branch concerns only when they materially change the recommendation.
- Ask one question at a time when clarification is needed.
- If the idea contains multiple independent systems, stop and decompose it before discussing details.
- Present 2-3 approaches only when they represent meaningfully different paths.
- Cluster divergent ideas by underlying angle, then converge on the strongest path.
- Before finalizing, check for contradictions, vague scope, missing constraints, and untested assumptions.
- Cite evidence when it shapes the recommendation.
- Treat every user statement as a claim to examine, not a premise to endorse; stay impartial and keep it open to debate.
- Critique the idea, not the user.
- Prefer a clear recommendation over a long option list.
- Do not drift into generic brainstorming.
- Assume the work will be done in one go unless the user explicitly asks for MVPs, phases, or staged deployment.
