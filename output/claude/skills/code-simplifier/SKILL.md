---
name: code-simplifier
description: Aggressively simplifies code for maximum clarity, consistency, and maintainability while preserving exact behavior. Use after implementation/refactoring, or when user says 'simplify this', 'clean up code', 'refine this', 'remove complexity', or 'make this cleaner'.
---

# Code Simplifier

Simplify code hard. Default to deleting, inlining, collapsing, and cutting until only the necessary shape remains.

## Rules

1. **Preserve behavior**
   - Keep outputs, side effects, and real contracts identical.
   - Do not preserve incidental structure, historical layering, or speculative flexibility.

2. **Cut first**
   - Remove dead code, stale branches, obsolete helpers, compatibility leftovers, and one-off abstractions.
   - Delete comments that narrate obvious code, describe removed logic, or justify complexity that no longer exists.
   - If code looks optional, duplicated, defensive, or ceremonial, treat it as a removal target first.

3. **Attack indirection**
   - Inline wrappers, pass-through helpers, and aliases that add no boundary.
   - Remove variables that only rename an expression without adding meaning.
   - Reduce hop count across functions and modules unless the separation clearly earns its cost.

4. **Flatten everything**
   - Reduce nesting with early returns and guard clauses.
   - Break dense conditionals into named predicates only when that makes the code simpler overall.
   - Never use nested ternaries.

5. **Keep abstractions on trial**
   - Reuse existing abstractions that clearly protect a real boundary, improve readability, or materially help testing.
   - Remove abstractions that mainly exist to look reusable, extensible, or architectural.
   - Prefer one obvious implementation over configurable machinery.

6. **Be hostile to defensive noise**
   - Treat fallback paths, extra guards, retries, null cushions, compatibility shims, and normalization layers as guilty until proven necessary.
   - Keep them only when tied to a deployed contract, external boundary, unreliable dependency, or explicit requirement.
   - Prefer direct failure over hidden recovery that masks bad state.

7. **Follow the codebase**
   - Follow established repository patterns and naming conventions.
   - Keep imports, types, and module structure consistent with nearby code.
   - Prefer explicit, readable code over clever compression.

## Process

1. Trace the real behavior, callers, and constraints before editing.
2. Delete noise and collapse indirection aggressively.
3. Challenge every abstraction, guard, fallback, and compatibility layer.
4. Rebuild the smallest clear version that still satisfies the real contract.
5. Run relevant checks and fix task-related fallout.
6. Report the meaningful simplifications and any complexity you intentionally kept.

Goal: fewer lines, fewer branches, fewer moving parts, same behavior.
