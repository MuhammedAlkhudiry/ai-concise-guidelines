---
name: code-simplifier
description: Code/test simplification after implementation or refactor, for simplify this, clean up code, remove complexity, prune brittle tests, or overgrown files.
---

# Code Simplifier

Simplify hard until only the necessary shape remains.

## Workflow

1. If no scope is specified, use the current `git diff`.
2. Trace touched files, callers, consumers, tests, imports, exports, config, and contracts.
3. Remove anything unreferenced, unreachable, superseded, duplicated, obsolete, or incidental.
4. Apply the `code-principles` solution ladder, then collapse indirection and rebuild the clearest version that keeps the contract.
5. Refactor related tests with app code and clean them when removal or rewriting is clearly safe.
6. Run `check-and-fix`, fix task-related fallout, and report simplifications, protected behavior, unsafe deletions, and kept complexity.

## Rules

- Preserve outputs, side effects, and real contracts. Do not preserve incidental structure.
- For every line, ask whether it still has a job.
- For large surfaces, split by module, behavior, or file group and use subagents when useful.
- Use explorer subagents for read-only tracing and workers only for disjoint edit scopes; the main agent owns integration and verification.
- Remove dead code, stale branches, obsolete helpers, compatibility leftovers, comments about removed logic, and one-off abstractions.
- Create, move, split, or merge files when the simple end state needs it.
- Inline wrappers, aliases, pass-through helpers, one-use values, useless temporary variables, and aliased destructuring.
- Flatten nesting with early returns and guard clauses. Never use nested ternaries.
- Treat new helpers, fallback paths, guards, retries, null cushions, shims, and normalization as guilty until tied to a real boundary.
- Follow local patterns and prefer explicit readable code over clever compression.

## React Prop Simplification

- Remove unused, redundant, constant, speculative, or "just in case" props and all tests, mocks, fixtures, defaults, and call-site arguments that only supported them.
- Inline constants at the component boundary; collapse pass-through props when the middle component adds no behavior.
- Let components read clean local or global state directly when prop drilling only mirrors that state.
- Replace mode, variant, and boolean props with composition, separate component shapes, or local conditionals when that removes branching.
- Keep props for real external contracts, caller-owned decisions, public reusable APIs, or important test boundaries.

## State Simplification

- Delete local state that only mirrors props, URL params, server data, form libraries, stores, or render-derived values.
- Replace synchronization effects with direct derivation, selectors, memoization, or one value owner.
- Collapse reducers, setters, and handlers that only shuttle values between equivalent shapes.
- Keep state when it represents user input in progress, async lifecycle, optimistic updates, animation, focus, or other real temporal behavior.

## Data Shape Simplification

- Remove mapping, normalization, fallback fields, adapters, and DTO copies unless they protect a real boundary.
- Inline one-off transformed objects when the original data is readable at the use site.
- Delete defensive reshaping for impossible states once callers, schemas, fixtures, and tests prove the shape.
- Keep adapters at API, persistence, framework, third-party, migration, or compatibility boundaries.

## Test Cleanup
Use `test-writing`.
Delete or merge tests only when the remaining suite protects the behavior and the candidate is removed, unreachable, unsupported, duplicated, overfit, or fixture-only.
Keep tests that cover real regressions, public contracts, security/auth/money/destructive paths, boundaries, integrations, or framework wiring.
Also keep tests for unknown flakes or otherwise unshown behavior.
