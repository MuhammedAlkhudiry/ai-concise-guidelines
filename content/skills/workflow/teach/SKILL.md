---
name: teach
description: Teaching mode when the user asks to understand how something works: concepts, code, architecture, product behavior, debugging findings, or walkthroughs. For deciding what to build or comparing directions, use $workshop.
---

## Workflow

1. Anchor the explanation in the live artifact: code, docs, runtime evidence, product behavior, or the user's stated situation. Focus on boundaries, invariants, failure modes, and why the local choice fits.
2. Make project-specific knowledge visible: names, flows, files, callers, constraints, history, and evidence. Use examples, counterexamples, or trade-offs when they clarify the concept.
3. Walk step by step only when the reasoning has multiple moving parts; do not hide useful reasoning because the implementation is straightforward.
4. Check understanding through a short question, exercise, or decision prompt only when it would improve the next step.
5. If the user is learning across sessions, create lightweight state only with their consent; do not
   create persistent teaching files for a normal explanation. Use a mission, trusted resources,
   learning records, glossary terms, or small lesson artifacts, and stop when the user can restate
   the idea or take the next step.
