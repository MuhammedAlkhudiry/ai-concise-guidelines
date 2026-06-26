---
name: code-principles
description: Code implementation, bug-fix, refactor, and review principles for directness, helper reuse, compatibility, data shape checks, and avoiding overprotection.
---

# Code Principles

Use these principles when changing or reviewing code.

## Defaults

- Keep implementation direct and right-sized. Avoid speculative guards, cleanup, normalization, and future-proofing.
- Choose the highest rung that solves the problem: skip speculative work, reuse existing code, use the standard library, use native platform behavior, use an installed dependency, write one clear line, then write the minimum new code.
- Prefer simple truthy, falsy, and presence checks over explicit `true`, `false`, or `null` comparisons.
- Avoid `instanceof` unless exact value or type semantics matter.
- Search for existing helpers, functions, and local patterns before adding a helper.
- Add helpers only when they protect a real boundary or remove real duplication.
- Delete pass-through wrappers, aliases, and helpers unless they protect a real boundary.
- Confirm the data model before touching data; never assume schema details.

## Bug Fixes

- Treat the reported failure as a symptom until the shared mechanism is identified.
- Before changing a function, inspect nearby callers, sibling flows, tests, and route or component entry points that could hit the same behavior.
- Prefer one root-cause fix in the canonical owner over repeated guards at individual callers.

## Compatibility

- Prefer the correct change over backward compatibility or artificially constrained fixes.
- Keep backward compatibility only for deployed, production, inter-system contracts.
- For undeployed, non-production, or one-system changes, make a clean-cut change.
- For bugs, prefer the most direct correct fix first.
- If backward compatibility adds complexity, call that out and ask whether a clean-cut change is acceptable.

## Boundaries

Add defensive checks, cleanup like `trim()`, regex normalization, shims, wrappers, or compatibility branches only when they are needed for a real boundary, runtime uncertainty, input contract, or compatibility constraint.
