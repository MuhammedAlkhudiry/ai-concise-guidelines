---
name: test-suite-cleanup
description: "Clean and simplify automated tests by removing stale, duplicate, and overspecific cases while preserving real behavior coverage. Use when the user asks to clean the test suite, prune outdated tests, remove brittle cases, or simplify overgrown test files."
---

# Test Suite Cleanup

Clean test suites without an approval gate when the removal is clearly safe. If there is real doubt, keep the test and list it under `Not safe to delete yet`.

## Workflow

1. Read the target tests, the production code they cover, nearby callers, and existing regression history.
2. Classify each candidate as one of: stale, duplicate, overspecific, noisy, flaky, or still valuable.
3. Delete or rewrite clearly safe cases immediately.
4. Keep uncertain cases, add them to `Not safe to delete yet`, and say what proof is missing.
5. Run the smallest relevant test target first, then broader checks.

## Delete Without Approval When All Are True

- The behavior is removed, unreachable, or no longer a supported contract.
- The test adds no unique signal because another test already covers the same behavior.
- The test is coupled to implementation details rather than observable behavior.
- Removing or merging it still leaves the behavior protected by remaining tests.

## Common Safe Cleanup

- Delete tests for deleted features, dead flags, removed branches, or obsolete error messages.
- Merge duplicate tests that differ only in fixture noise, setup style, or naming.
- Replace overspecific assertions on internal calls, private structure, exact ordering, or incidental formatting with behavior-level assertions.
- Trim redundant permutations when one focused boundary test already proves the behavior.
- Remove setup, helpers, or fixtures that no longer affect the assertion.

## Not Safe To Delete Yet

Do not delete without stronger proof when the test covers any of these:

- A real bug regression.
- A public contract: API, CLI, event, serialized payload, DB shape, or cross-system behavior.
- Security, auth, permissions, money, destructive actions, or irreversible state changes.
- Boundary behavior such as null, empty, limit, timezone, rounding, or failure-path handling.
- An integration seam with external services, queues, jobs, storage, or framework wiring.
- A flaky test where the cause is still unknown.
- Any case where you cannot show what remaining test still protects the behavior.

## Rewrite Rules

- Prefer fewer broader behavior tests over many narrow implementation tests.
- Keep the smallest set that protects intent, boundaries, and regressions.
- Rename tests to describe behavior, not methods or internals.
- When deleting a test, also remove stale comments, fixtures, factories, helpers, and data providers tied only to that test.

## Output

Report:

- What was deleted or simplified.
- What behavior remains protected after cleanup.
- `Not safe to delete yet` with a one-line reason for each item.
- Commands run and results.
