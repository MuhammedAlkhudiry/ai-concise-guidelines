---
name: test-writing
description: Writing, reviewing, updating, or auditing automated tests while avoiding brittle, overfit, snapshot-heavy, mock-heavy, or implementation-detail coverage.
---

Protect behavior contracts, not implementation details.

## Workflow
1. Trace the real caller, consumer, route, component, command, job, or workflow.
2. Name the focused behavior contract and check whether existing tests already protect it.
3. For reviews or audits, report the coverage and test-quality findings, then stop.
4. For writing or update requests, skip tests that are already covered, implementation-only, or cheaper to verify manually.
5. Choose the test layer that proves the remaining contract.
6. Write the test so it fails for the right reason, make it pass, and run the focused target.
7. Check that it survives reasonable refactors and fails on the target contract break.

## Rules

- Test observable behavior: returned result, rendered UI, persisted data, emitted event, queued job, authorization, validation, integration boundary, or regression.
- Do not test private calls, helper names, incidental call order, internal branching, intermediate objects, non-contract storage shape, irrelevant DOM nesting, or mock-only behavior.
- Do not add a bug-fix regression test unless it would fail on the original bug and protect behavior users or callers actually rely on.
- For repo-wide or directory-wide test audits, also use $deep-work systematic mode and `references/repo-test-audit.md`.
- For writing or update requests, delete, merge, or rewrite overfit tests: private APIs, helper calls, internal branches, broad snapshots, non-contract mock order, giant fixtures, and uncontrolled generated values.
- Mock boundaries, not implementation reenactment. Verify mock calls only when the call itself is the contract.
- Use unit tests for stable unit contracts.
- Use integration or feature tests for wiring, persistence, framework behavior, permissions, UI rendering, events, jobs, or multiple collaborators.
- Do not split one behavior into many branch-shaped unit tests when one clearer test proves the invariant better.
- Accept a test only when it protects a named contract, catches the intended break, survives reasonable refactors, avoids implementation details, and mocks only real boundaries.
