---
name: test-writing
description: Writing, reviewing, updating, or auditing automated tests while avoiding brittle, overfit, snapshot-heavy, mock-heavy, or implementation-detail coverage.
---

# Test Writing
Write tests that protect behavior contracts, not implementation.
The default is not to add a test until a specific uncovered contract or regression has been named.

## Core Rule
Name the contract before writing the test. If it cannot be named in one sentence, trace the behavior first.
Test observable behavior: returned result, rendered UI, persisted data, emitted event, queued job, authorization, validation, integration boundary, or regression.
Do not test private calls, helper names, incidental call order, internal branching, intermediate objects, non-contract storage shape, or irrelevant DOM nesting.
Do not write mocks that only prove other mocks were called.
Do not add a bug-fix regression test unless it would fail on the original bug and protect behavior users or callers actually rely on.

## Workflow
1. Read nearby tests and copy local style.
2. Trace the real caller, consumer, route, component, command, job, or workflow.
3. Name the focused behavior contract.
4. Check whether existing tests already protect that contract.
5. Skip the test when the contract is already covered, too weak to name, implementation-only, or cheaper to verify manually.
6. Choose the right test layer that proves the remaining contract.
7. Write the test so it fails for the right reason.
8. Make it pass with a focused product change that satisfies the contract.
9. Run the focused test, refactor-survival check, and bug-kill check.

## Repo Test Audits
For complete repo-wide or directory-wide test audits, also use `deep-work` systematic mode.
Read `references/repo-test-audit.md`, build an explicit inventory of every test file or case in scope, and continue until each item is classified, fixed, deleted, merged, moved, or explicitly left with a named uncertainty.

## Overfit Tests
Delete, merge, or rewrite overfit tests.
Red flags: private APIs, helper calls, internal branches, broad snapshots, non-contract mock order, giant fixtures, and uncontrolled generated values.
Treat tests that pass while user-visible behavior is broken as overfit.

## Mocking
Mocks are for boundaries, not implementation reenactment.
Mock external services, network, time, randomness, filesystem boundaries, expensive infrastructure, and framework boundaries when the repo already does so.
Mock queues only when queue execution is not under test.
Verify mock calls only when the call itself is the contract: email, job dispatch, payment charge, audit log, third-party API payload, or similar boundary behavior.

## Test Layer
Use unit tests for stable unit contracts.
Use integration or feature tests for wiring, persistence, framework behavior, permissions, UI rendering, events, jobs, or multiple collaborators.
Do not split one behavior into many branch-shaped unit tests when one clearer test proves the invariant better.

## Final Gate
Before accepting a test, ask what contract it protects, what regression it catches, what refactor it survives, and what implementation detail it avoids.
Also ask whether every mock is a real boundary and whether the focused test ran.
If the answers are weak, improve the test. If the test cannot be made honest, delete it and name the gap.
If there is no honest gap, explicitly leave the code without new tests instead of manufacturing coverage.
