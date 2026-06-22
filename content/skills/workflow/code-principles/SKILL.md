---
name: code-principles
description: Code implementation, bug-fix, refactor, and review principles for directness, helper reuse, compatibility, data shape checks, and avoiding overprotection.
---

# Code Principles

Use these principles while changing or reviewing code.

## Defaults

- Keep implementation direct and right-sized. Avoid speculative guards, cleanup, normalization, and future-proofing.
- Prefer simple truthy, falsy, and presence checks over explicit comparisons to `true`, `false`, or `null`.
- Avoid `instanceof` unless exact value or type semantics matter.
- Search for existing helpers, functions, and local patterns before adding a helper.
- Add helpers only when they protect a real boundary or remove real duplication.
- Delete pass-through wrappers, aliases, and helpers unless they protect a real boundary.
- Confirm the data model before touching data; never assume schema details.

## Compatibility

- Prefer the correct change over backward compatibility or artificially constrained fixes.
- Keep backward compatibility only for deployed, production, inter-system contracts.
- If a feature is not deployed, the system is not production, or the change is within one system, make a clean-cut change.
- For bugs, prefer the most direct correct fix first.
- If backward compatibility adds complexity, call that out and ask whether a clean-cut change is acceptable.

## Boundaries

Add defensive checks, cleanup like `trim()`, regex normalization, shims, wrappers, or compatibility branches only when they are needed for a real boundary, runtime uncertainty, input contract, or compatibility constraint.
