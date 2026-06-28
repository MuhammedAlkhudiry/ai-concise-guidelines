---
name: code-simplifier
description: Code and test simplification after implementation or refactor, especially simplify this, clean up code, remove complexity, make this cleaner, prune brittle tests, or simplify overgrown files.
---

# Code Simplifier

Simplify hard until only the necessary shape remains.

## Workflow

1. If no scope is specified, use the current `git diff`.
2. Trace touched files, callers, consumers, tests, imports, exports, config, and contracts.
3. Remove anything unreferenced, unreachable, superseded, duplicated, obsolete, or incidental.
4. Apply the `code-principles` solution ladder, then collapse indirection and rebuild the clearest version that keeps the contract.
5. Refactor related tests with app code and clean them when removal or rewriting is clearly safe.
6. Run `check-and-fix`, fix task-related fallout, and report simplifications, protected behavior, anything under `Not safe to delete yet`, and complexity intentionally kept.

## Rules

- Preserve outputs, side effects, and real contracts. Do not preserve incidental structure.
- For every line, ask whether it still has a job.
- For large surfaces, split by module, behavior, or file group and use subagents when available and delegation is allowed.
- Use explorer subagents for read-only tracing and worker subagents only for disjoint edit scopes; the main agent owns integration, final simplification, and verification.
- Remove dead code, stale branches, obsolete helpers, compatibility leftovers, comments about removed logic, and one-off abstractions.
- Create, move, split, or merge files when the simple end state needs it.
- Inline wrappers, aliases, pass-through helpers, one-use values, useless temporary variables, aliased destructuring, and variables that only rename an expression; prefer direct object access when it stays readable.
- Flatten nesting with early returns and guard clauses. Never use nested ternaries.
- Treat new helpers, fallback paths, guards, retries, null cushions, shims, and normalization layers as guilty until tied to a real boundary.
- Follow local patterns and prefer explicit readable code over clever compression.

## React Prop Simplification

When simplifying React components, treat every prop as a contract that must earn its place.

- Remove unused, redundant, constant, speculative, or "just in case" props.
- Inline constants at the component boundary instead of threading them through props.
- Collapse pass-through props when the intermediate component adds no meaningful behavior.
- Let a component read clean local or global state directly when prop drilling only mirrors that state.
- Replace mode, variant, and boolean props with clearer composition, separate component shape, or local conditional render when that removes branching complexity.
- Delete prop types, defaults, destructured values, call-site arguments, tests, mocks, and fixtures that only supported removed props.
- Keep props when they represent a real external contract, caller-owned decision, public reusable API, or important test boundary.

## State Simplification

Remove state that only restates something already known.

- Delete local state that only mirrors props, URL params, server data, form libraries, stores, or values derivable during render.
- Replace synchronization effects with direct derivation, selectors, memoization, or a single owner for the value.
- Collapse reducers, setters, and event handlers that only shuttle values between equivalent shapes.
- Keep state when it represents user input in progress, async lifecycle, optimistic updates, animation, focus, or other real temporal behavior.

## Data Shape Simplification

Prefer the real data shape over local shadow shapes.

- Remove mapping, normalization, fallback fields, adapter objects, and DTO copies unless they protect a real boundary.
- Inline one-off transformed objects when the original data is readable at the use site.
- Delete defensive reshaping for impossible states once callers, schemas, fixtures, and tests prove the shape.
- Keep adapters at API, persistence, framework, third-party, migration, or compatibility boundaries.

## Test Cleanup

Use `test-writing`; delete or merge tests only when the remaining suite still protects the behavior and the candidate covers removed, unreachable, unsupported, duplicated, overfit, or fixture-only coverage.

Do not delete without stronger proof when a test covers a real regression, public contract, security/auth/money/destructive path, boundary behavior, external integration, framework wiring, unknown flake, or behavior no remaining test can show.
