---
name: _grill-me
description: Stress-test a plan or design by interrogating assumptions one branch at a time until the shape is clear. Use when the user wants to get grilled on a design, pressure-test a plan, or says "grill me".
---

# Grill Me

Interrogate the plan until the meaningful branches of the decision tree are resolved.

## Workflow

1. Restate the proposed plan briefly so the target is explicit.
2. Walk one branch at a time through goals, constraints, interfaces, state, failure modes, rollout, and maintenance.
3. Ask one question at a time.
4. After each question, provide the recommended answer or strongest default.
5. If the answer can be found by exploring the codebase or docs, inspect them instead of asking.
6. Continue until the remaining uncertainty no longer changes the design.

## Rules

- Prefer consequential questions over generic brainstorming.
- Surface hidden assumptions, coupling, migration risk, and operational cost.
- Challenge vague terms until they become concrete.
- Do not batch questions unless the user asks for a faster pass.
- Finish with the unresolved risks and the recommended decision.
