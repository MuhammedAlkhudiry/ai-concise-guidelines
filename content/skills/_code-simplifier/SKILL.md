---
name: _code-simplifier
description: Aggressively simplifies code and tests for maximum clarity, consistency, and maintainability while preserving exact behavior. Use after implementation/refactoring, or when user says 'simplify this', 'clean up code', 'refine this', 'remove complexity', 'make this cleaner', clean the test suite, prune outdated tests, remove brittle cases, or simplify overgrown test files.
---

# Code Simplifier

Simplify code hard. Default to deleting, inlining, collapsing, and cutting until only the necessary shape remains.

## Rules

1. **Preserve behavior**
   - Keep outputs, side effects, and real contracts identical.
   - Do not preserve incidental structure, historical layering, or speculative flexibility.

2. **Cut first**
   - Run a strict dead-code pass on touched files and their immediate callers, consumers, tests, imports, exports, and config.
   - Remove dead code, stale branches, obsolete helpers, compatibility leftovers, and one-off abstractions.
   - Delete comments that narrate obvious code, describe removed logic, or justify complexity that no longer exists.
   - If a path, helper, flag, type, or test no longer has a real job, delete it in the same change.
   - If code looks optional, duplicated, defensive, or ceremonial, treat it as a removal target first.

3. **Attack indirection**
   - Inline wrappers, pass-through helpers, and aliases that add no boundary.
   - Remove variables that only rename an expression without adding meaning.
   - Inline one-use values, expressions, and callbacks when extracting them does not materially improve clarity.
   - In JSX or TSX, minimize prop plumbing: do not pass data, flags, handlers, class names, or derived values that the child can obtain, compute, or inline cleanly itself.
   - Avoid pass-through props that only relay the same value through intermediate components without adding a real boundary.
   - Avoid boolean props and mode props when a simpler component shape, child composition, or local conditional render removes the need.
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

## Test Cleanup

Clean test suites without an approval gate when the removal is clearly safe. If there is real doubt, keep the test and list it under `Not safe to delete yet`.

1. Read the target tests, the production code they cover, nearby callers, and existing regression history.
2. Classify each candidate as stale, duplicate, overspecific, noisy, flaky, or still valuable.
3. Delete or rewrite clearly safe cases immediately.
4. Keep uncertain cases, add them to `Not safe to delete yet`, and say what proof is missing.
5. Run the smallest relevant test target first, then broader checks.

Delete or merge tests when all are true:

- The behavior is removed, unreachable, or no longer a supported contract.
- Another test already covers the same behavior with equal or better signal.
- The test is coupled to implementation details rather than observable behavior.
- Removing or merging it still leaves the behavior protected by remaining tests.

Common safe cleanup:

- Delete tests for deleted features, dead flags, removed branches, or obsolete error messages.
- Merge duplicate tests that differ only in fixture noise, setup style, or naming.
- Prefer fewer broader behavior tests over many narrow implementation tests.
- Keep the smallest set that protects intent, boundaries, and regressions.
- Rename tests to describe behavior, not methods or internals.
- Replace overspecific assertions on internal calls, private structure, exact ordering, or incidental formatting with behavior-level assertions.
- Trim redundant permutations when one focused boundary test already proves the behavior.
- Remove setup, helpers, fixtures, factories, or data providers that no longer affect an assertion.

Do not delete without stronger proof when a test covers:

- A real bug regression.
- A public contract: API, CLI, event, serialized payload, DB shape, or cross-system behavior.
- Security, auth, permissions, money, destructive actions, or irreversible state changes.
- Boundary behavior such as null, empty, limit, timezone, rounding, or failure-path handling.
- Integration with external services, queues, jobs, storage, or framework wiring.
- A flaky test where the cause is still unknown.
- Any case where the remaining behavior coverage cannot be shown.

## Process

1. Trace the real behavior, callers, and constraints before editing.
2. Run a strict dead-code check on touched areas and remove anything unreferenced, unreachable, superseded, or obsolete.
3. Delete noise and collapse indirection aggressively.
4. Challenge every abstraction, guard, fallback, and compatibility layer.
5. Rebuild the smallest clear version that still satisfies the real contract.
6. Run relevant checks and fix task-related fallout.
7. Report the meaningful simplifications, dead code removed, what behavior remains protected after test cleanup, anything under `Not safe to delete yet`, and any complexity intentionally kept.

Goal: fewer lines, fewer branches, fewer moving parts, same behavior.
