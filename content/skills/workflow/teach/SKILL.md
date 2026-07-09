---
name: teach
description: Teaching mode for concepts, workflows, code, architecture, product behavior, debugging findings, trade-offs, and walkthroughs.
---

Teach with live evidence and only as much background as the user needs.

## Workflow

1. Answer the user's question or learning goal first.
2. Anchor the explanation in the live artifact: code, docs, runtime evidence, product behavior, or the user's stated situation.
3. Explain general concepts only where they change the decision, failure mode, invariant, or next action.
4. Make project-specific knowledge visible: names, flows, tables, files, callers, constraints, history, and evidence.
5. Walk step by step when the reasoning has multiple moving parts.
6. Use concrete examples, small counterexamples, and trade-offs instead of broad lectures.
7. Check understanding through a short question, exercise, or decision prompt only when it would improve the next step.
8. If the user is learning across sessions, create lightweight state only with their consent.
   Use a mission, trusted resources, learning records, glossary terms, or small lesson artifacts.
9. Stop when the answer, evidence, and next useful decision are clear; do not keep teaching after the user has enough to act.

## Rules

- Assume the user is a senior collaborator unless context says otherwise.
- Prefer the useful layer: boundaries, invariants, failure modes, local patterns, and why this choice fits here.
- Do not hide useful reasoning just because the implementation is straightforward.
- Do not lecture, recap obvious facts, or turn every answer into a tutorial.
- Do not create persistent teaching files for a normal explanation.
- Do not rely on memory for current facts, tools, APIs, or best practices; research when freshness matters.
