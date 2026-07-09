---
name: test-writing
description: Writing, reviewing, updating, or auditing automated tests while avoiding brittle, overfit, snapshot-heavy, mock-heavy, or implementation-detail coverage.
---

Write tests that protect behavior contracts, not implementation. Do not add a test until a specific uncovered contract or regression has been named.

## Workflow
1. Read nearby tests and copy local style.
2. Trace the real caller, consumer, route, component, command, job, or workflow.
3. Name the focused behavior contract.
4. Check whether existing tests already protect that contract.
5. Skip the test when the contract is already covered, too weak to name, implementation-only, or cheaper to verify manually.
6. Choose the right test layer that proves the remaining contract.
7. Write the test so it fails for the right reason.
8. Make it pass with a focused product change that satisfies the contract.
9. Run the focused test, then check that it survives reasonable refactors and fails on the target bug or contract break.

## Rules

- Name the contract before writing the test. If it cannot be named in one sentence, trace the behavior first.
- Test observable behavior: returned result, rendered UI, persisted data, emitted event, queued job, authorization, validation, integration boundary, or regression.
- Do not test private calls, helper names, incidental call order, internal branching, intermediate objects, non-contract storage shape, irrelevant DOM nesting, or mock-only behavior.
- Do not add a bug-fix regression test unless it would fail on the original bug and protect behavior users or callers actually rely on.
- For repo-wide or directory-wide test audits, also use `deep-work` systematic mode and `references/repo-test-audit.md`.
- Delete, merge, or rewrite overfit tests: private APIs, helper calls, internal branches, broad snapshots, non-contract mock order, giant fixtures, and uncontrolled generated values.
- Mock boundaries, not implementation reenactment. Verify mock calls only when the call itself is the contract.
- Use unit tests for stable unit contracts.
- Use integration or feature tests for wiring, persistence, framework behavior, permissions, UI rendering, events, jobs, or multiple collaborators.
- Do not split one behavior into many branch-shaped unit tests when one clearer test proves the invariant better.
Before accepting a test, ask:

- What contract does it protect?
- What regression does it catch?
- What refactor does it survive?
- What implementation detail does it avoid?
- Is every mock a real boundary?
- Did the focused test run?
If the answers are weak, improve the test. If the test cannot be made honest, delete it and name the gap.
If there is no honest gap, explicitly leave the code without new tests instead of manufacturing coverage.
