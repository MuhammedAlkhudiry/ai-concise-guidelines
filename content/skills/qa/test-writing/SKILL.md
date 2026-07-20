---
name: test-writing
description: Test coverage audits and test writing, review, or updates for a named behavior, feature, bug, or broad test surface.
---

## Workflow

1. Classify the request as audit or review versus writing or updating, then trace the named behavior and its existing tests.
2. Apply the test-quality rules below. For a repo, directory, suite, or other broad surface, also use $deep-work systematic mode and the repository-audit workflow.
3. For audit or review requests, report findings without editing. For writing or update requests, run the official focused test command and report coverage, changes, results, and remaining risk.

## Test quality

- Name the observable behavior contract before accepting, adding, or changing a test.
- Add coverage only for a meaningful behavior gap such as changed behavior, a boundary, failure, authorization, persistence, integration, or user-visible state.
- Add a bug regression only when it fails on the original bug and protects behavior users or callers rely on.
- Reject tests of private calls, incidental order or branching, intermediate objects, non-contract storage shapes, irrelevant DOM structure, framework behavior, or mock and fixture choreography.
- Prefer the lowest test layer that proves the contract. Use integration or feature coverage when the contract includes wiring, persistence, framework behavior, permissions, rendered UI, events, jobs, or multiple collaborators.
- Mock real boundaries rather than reenacting implementation. Verify a call only when the call itself is the contract.
- Accept a test only when it catches the intended break and survives reasonable implementation refactors.

## Repository test audit

1. Define the exact scope and build a durable inventory from the repository's test-discovery sources. Split large inventories into non-overlapping slices.
2. Track every test file or case as:
   - `keep`: valid contract and healthy test.
   - `rewrite`: useful contract but brittle, shallow, overfit, or at the wrong layer.
   - `merge`: duplicated coverage or one contract split into branch-shaped tests.
   - `move`: valid test in a stale or misleading location.
   - `delete`: invalid, redundant, stale, or non-contractual.
   - `investigate`: requires product, implementation, or external-service evidence.
   - `unclear`: cannot be decided safely with available evidence.
3. Name the protected contract for every retained test and assess missing coverage, duplication, brittleness, placement, runtime, and flakiness. Passing verification alone does not establish suite quality.
4. Prefer rewriting or merging when the behavior matters. Delete only when equivalent coverage exists or the final report records the resulting gap.
5. When the user approves auditing and repairing the full scope, proceed through classification, edits, moves, deletions, and verification without per-item approval unless a decision is product-sensitive or genuinely unclear.
6. Finish with the inventory source, total reviewed, counts by status, material changes, runtime or flakiness findings, commands and results, and every unresolved item.
