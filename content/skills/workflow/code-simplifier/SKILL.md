---
name: code-simplifier
description: Code and test simplification after implementation or refactor, including cleanup, complexity reduction, brittle tests, and overgrown files.
---

Simplify hard until only the necessary shape remains.

## Workflow

1. If no scope is specified, use the current `git diff`.
2. Trace touched files, callers, consumers, tests, imports, exports, config, and contracts.
3. Remove anything unreferenced, unreachable, superseded, duplicated, obsolete, or incidental.
4. Apply the `code-principles` solution ladder, then collapse indirection and rebuild the clearest version that keeps the contract.
5. Refactor related tests with app code and clean them when removal or rewriting is clearly safe.
6. Run `verification`, fix task-related fallout, and report simplifications, protected behavior, unsafe deletions, and kept complexity.

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
- For React, remove unused props, collapse pass-through props, replace mirrored state with derivation, and keep props/state only for real caller decisions or temporal behavior.
- For data shapes, remove mapping, normalization, fallback fields, adapters, and DTO copies unless they protect API, persistence, framework, third-party, migration, or compatibility boundaries.
- Use `test-writing` for test cleanup. Delete or merge tests only when the remaining suite protects the behavior and the candidate is removed, unreachable, unsupported, duplicated, overfit, or fixture-only.
- Keep tests for real regressions, public contracts, security/auth/money/destructive paths, boundaries, integrations, framework wiring, unknown flakes, or otherwise unshown behavior.
