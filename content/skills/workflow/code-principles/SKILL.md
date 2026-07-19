---
name: code-principles
description: Code implementation and review preferences for solution selection, helper design, value checks, and compatibility boundaries.
---

## Rules

- Choose the highest rung that solves the problem: reuse existing code, use standard-library or native behavior, use an installed dependency, then write the minimum new code.
- Prefer simple truthy, falsy, and presence checks over explicit `true`, `false`, or `null` comparisons.
- Avoid `instanceof` unless exact value or type semantics matter.
- Add helpers only when they protect a real boundary or remove real duplication; remove pass-through wrappers and aliases.
