---
name: test-writing
description: Writing, reviewing, or updating automated tests for product code, especially preventing brittle, overfit, implementation-detail-heavy, snapshot-heavy, or mock-heavy tests. Use alongside TDD, coverage audits, bug fixes, regression tests, test cleanup, and code review when automated tests are added or changed.
---

# Test Writing
Write tests that protect behavior contracts, not the current implementation.
A test is overfit when it pins implementation instead of behavior. It is bad if a correct refactor breaks it. It is bad if broken behavior does not. Fight test theater hard: fake confidence is worse than an honest gap.

## Core Rule
Name the contract before writing the test. If the contract cannot be named in one sentence, stop and trace the behavior first.
Test observable behavior: returned result, rendered UI, persisted data, emitted event, queued job, authorization, validation, integration boundary, or regression that must not return.
Do not test private method calls, helper names, incidental call order, internal branching, exact intermediate objects, copied storage shape, DOM nesting users do not depend on, or mocks proving that other mocks were called.

## Workflow
1. Read nearby tests and copy local style.
2. Trace the real caller, consumer, route, component, command, job, or workflow.
3. Name the focused behavior contract.
4. Choose the right test layer that proves that contract.
5. Write the test so it fails for the right reason.
6. Make it pass with a focused product change that satisfies the contract.
7. Run the focused test target.
8. Run the refactor-survival check.
9. Run the bug-kill check.

## Overfit Tests
Delete, merge, or rewrite overfit tests. Do not preserve bad tests out of politeness.
Red flags:
- private APIs, helper calls, internal branches, or exact intermediate objects
- broad snapshots without a named contract
- mock call order unless order is the contract
- giant fixtures where two fields prove the behavior
- generated IDs, timestamps, markup, or storage shape unless controlled or contractual
- tests that pass while user-visible behavior is broken

## Mocking
Mocks are for boundaries, not reenacting implementation.
Mock external services, network, time, randomness, filesystem boundaries, queues when execution is not under test, expensive infrastructure, and framework boundaries when the repo already does so.
Verify mock calls only when the call itself is the contract: email, job dispatch, payment charge, audit log, third-party API payload, or similar boundary behavior.

## Test Layer
Use unit tests when the unit has a stable contract.
Use integration or feature tests when behavior depends on wiring, persistence, framework behavior, permissions, UI rendering, events, jobs, or multiple collaborators.
Do not split one behavior into many branch-shaped unit tests when one clearer test proves the invariant better.

## Final Gate
Before accepting a test, ask: what contract does this protect, what regression would it catch, what correct refactor would it survive, what implementation detail did it avoid pinning, is every mock a real boundary, and did the focused test run?
If the answers are weak, improve the test. If the test cannot be made honest, delete it and name the gap.
