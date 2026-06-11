---
name: improve
description: Slash-command improvement router for `/improve code`, `/improve ux`, `/improve db`, `/improve activation`, `/improve my-setup`, or domain targets like `/improve auth flow`.
---

# Improve

Use this skill when the user asks for `/improve ...`, asks what to improve, or asks for product, code, UX, database, activation, or setup improvement suggestions.

## Branches

- `/improve code`: read `references/code.md`.
- `/improve ux`, `/improve ui`, or product-flow targets like `/improve auth flow`: read `references/ux.md`.
- `/improve db`, `/improve database`, `/improve schema`, or query/data-model targets: read `references/db.md`.
- `/improve activation`, `/improve onboarding`, or first-value targets: read `references/activation.md`.
- `/improve my-setup`, `/improve setup`, or agent/tooling setup targets: read `references/my-setup.md`.

## Routing

- For open-ended `/improve`, inspect first, then choose the strongest branch and explain why.
- For named product areas, choose the branch by the dominant risk: UX for journeys, code for implementation quality, DB for persistence, activation for first value.
- Load only the selected branch reference and its directly named supporting files.
- These branches recommend changes only. Do not implement unless the user explicitly asks for execution.
