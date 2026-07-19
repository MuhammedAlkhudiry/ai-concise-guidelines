---
name: test-writing
description: Automated test coverage audits and focused test writing, review, or updates for a named behavior, feature, bug, or broad test surface.
---

Protect behavior contracts, not implementation details.

## Workflow

1. Define the target behavior: inputs, outputs, side effects, boundaries, permissions, persistence, integrations, and important failure paths.
2. Trace its implementation paths, callers, consumers, routes, screens, commands, jobs, and existing tests.
3. Use structural search when text results are ambiguous around calls, component usage, classes, methods, hooks, imports, or chains.
4. Report existing coverage as specific tested behaviors, not filenames.
5. Identify worthwhile gaps by observable behavior: happy path, changed behavior, boundary, error, authorization, regression, persistence, integration, or UI state.
6. Discard implementation-only assertions, duplicated coverage, low-risk copy or styling, framework behavior, private helpers, and mock- or fixture-only tests.
7. For audit or review requests, report the coverage, worthwhile gaps, and test-quality findings, then stop.
8. For writing or update requests, choose the layer that proves each remaining contract, write the focused test so it fails for the right reason, make it pass, and run the focused target.
9. Accept the result only when it survives reasonable refactors and fails on the target contract break. When no worthwhile gap remains, state the coverage or risk judgment that supports that conclusion.

## Rules

- Test observable behavior: returned result, rendered UI, persisted data, emitted event, queued job, authorization, validation, integration boundary, or regression.
- Do not test private calls, helper names, incidental call order, internal branching, intermediate objects, non-contract storage shape, irrelevant DOM nesting, or mock-only behavior.
- Do not add a bug-fix regression test unless it would fail on the original bug and protect behavior users or callers actually rely on.
- For repo-wide or directory-wide test audits, use $deep-work systematic mode and `references/repo-test-audit.md`.
- Discover official test commands from project files and existing documentation.
- Run the most focused relevant target first. Run broader tests only when the touched behavior is shared or the broader command is cheap enough to be useful.
- For writing or update requests, delete, merge, or rewrite overfit tests: private APIs, helper calls, internal branches, broad snapshots, non-contract mock order, giant fixtures, and uncontrolled generated values.
- Mock boundaries, not implementation reenactment. Verify mock calls only when the call itself is the contract.
- Use unit tests for stable unit contracts.
- Use integration or feature tests for wiring, persistence, framework behavior, permissions, UI rendering, events, jobs, or multiple collaborators.
- Do not split one behavior into many branch-shaped unit tests when one clearer test proves the invariant better.
- Accept a test only when it protects a named contract, catches the intended break, survives reasonable refactors, avoids implementation details, and mocks only real boundaries.
- Report what was already covered, what was missing, what changed, the exact commands and results, and any meaningful remaining risk.
