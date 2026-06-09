---
name: code-simplifier
description: Code and test simplification after implementation or refactor, especially simplify this, clean up code, remove complexity, make this cleaner, prune brittle tests, or simplify overgrown files.
---

# Code Simplifier

Simplify hard. Delete, inline, collapse, and cut until only the necessary shape remains.

## Workflow

1. If no scope is specified, use the current `git diff`.
2. Trace touched files, callers, consumers, tests, imports, exports, config, and contracts before editing.
3. Remove anything unreferenced, unreachable, superseded, duplicated, obsolete, or incidental.
4. Collapse indirection and rebuild the smallest clear version that keeps the contract.
5. Refactor related tests with app code and clean them when removal or rewriting is clearly safe.
6. Run the related `check-and-fix` workflow for task-relevant checks and fix task-related fallout.
7. Report meaningful simplifications, protected behavior, anything under `Not safe to delete yet`, and complexity intentionally kept.

## Rules

- Preserve outputs, side effects, and real contracts. Do not preserve incidental structure.
- For every line, ask whether it still has a job.
- Remove dead code, stale branches, obsolete helpers, compatibility leftovers, comments about removed logic, and one-off abstractions.
- It is ok to do mid-refactor work when the simple end state needs it: create, move, split, or merge files instead of preserving awkward placement.
- Inline wrappers, aliases, pass-through helpers, one-use values, and variables that only rename an expression.
- In JSX/TSX, reduce prop plumbing and pass-through props; let children compute or read clean local data when that is simpler.
- Replace mode and boolean props with simpler component shape, composition, or local conditional render when possible.
- Flatten nesting with early returns and guard clauses. Never use nested ternaries.
- Treat new helpers, fallback paths, guards, retries, null cushions, shims, and normalization layers as guilty until tied to a real boundary.
- Follow local patterns and prefer explicit readable code over clever compression.

## Test Cleanup

Delete or merge tests when the remaining suite still protects the behavior and the candidate is:

- for removed, unreachable, or unsupported behavior
- duplicated by equal or better coverage
- coupled to implementation details
- only fixture/setup noise

Do not delete without stronger proof when a test covers:

- A real bug regression.
- A public contract: API, CLI, event, serialized payload, DB shape, or cross-system behavior.
- Security, auth, permissions, money, destructive actions, or irreversible state changes.
- Boundary behavior such as empty, limit, timezone, rounding, or failure-path handling.
- Integration with external services, queues, jobs, storage, or framework wiring.
- A flaky test where the cause is still unknown.
- Any case where the remaining behavior coverage cannot be shown.
