---
name: test-writing
description: Writing, reviewing, or updating automated tests for product code, especially preventing brittle, overfit, implementation-detail-heavy, snapshot-heavy, or mock-heavy tests. Use alongside coverage audits, bug fixes, regression tests, test cleanup, and code review when automated tests are added or changed.
---

# Test Writing
Write tests that protect behavior contracts, not implementation.

## Core Rule
Name the contract before writing the test. If it cannot be named in one sentence, trace the behavior first.
Test observable behavior: returned result, rendered UI, persisted data, emitted event, queued job, authorization, validation, integration boundary, or regression.
Do not test private calls, helper names, incidental call order, internal branching, intermediate objects, non-contract storage shape, irrelevant DOM nesting, or mocks proving other mocks were called.

## Workflow
1. Read nearby tests and copy local style.
2. Trace the real caller, consumer, route, component, command, job, or workflow.
3. Name the focused behavior contract.
4. Choose the right test layer that proves that contract.
5. Write the test so it fails for the right reason.
6. Make it pass with a focused product change that satisfies the contract.
7. Run the focused test, refactor-survival check, and bug-kill check.

## Overfit Tests
Delete, merge, or rewrite overfit tests.
Red flags: private APIs, helper calls, internal branches, broad snapshots, non-contract mock order, giant fixtures, uncontrolled generated values, and tests that pass while user-visible behavior is broken.

## Mocking
Mocks are for boundaries, not implementation reenactment.
Mock external services, network, time, randomness, filesystem boundaries, queues when execution is not under test, expensive infrastructure, and framework boundaries when the repo already does so.
Verify mock calls only when the call itself is the contract: email, job dispatch, payment charge, audit log, third-party API payload, or similar boundary behavior.

## Test Layer
Use unit tests for stable unit contracts. Use integration or feature tests for wiring, persistence, framework behavior, permissions, UI rendering, events, jobs, or multiple collaborators.
Do not split one behavior into many branch-shaped unit tests when one clearer test proves the invariant better.

## Final Gate
Before accepting a test, ask what contract it protects, what regression it catches, what refactor it survives, what implementation detail it avoids, whether every mock is a real boundary, and whether the focused test ran.
If the answers are weak, improve the test. If the test cannot be made honest, delete it and name the gap.
