---
name: refactoring
description: "Restructure code without changing behavior. Use when the user wants a refactor, cleanup, or structural improvement rather than a feature change."
---

# Refactoring

Refactor for structure, then finish with a `code-simplifier` pass.

## Rules

- No code until the refactor approach is approved.
- Behavior stays the same unless the user explicitly wants behavior changes.
- Tests are the safety net. Add or extend them before risky moves.

## Workflow

1. Read the target code, callers, callees, and tests.
2. Diagnose the actual smells: duplication, wrong boundaries, long methods, over-abstraction, bad names, hidden coupling.
3. Define the target shape and which contracts must stay stable.
4. Break the work into small independently verifiable phases.
5. After approval, execute phase by phase with tests between steps.
6. Run `code-simplifier` on the touched areas before finishing.

## Output

Provide:

- Current state
- Diagnosis with code references
- Target shape
- Phased plan
- Risks and mitigation
- Safety checks

## Smells To Look For

- Duplication
- Deep nesting
- Long parameter lists
- God classes or files
- Leaky or missing abstractions
- Misleading names
- Hidden shared state
