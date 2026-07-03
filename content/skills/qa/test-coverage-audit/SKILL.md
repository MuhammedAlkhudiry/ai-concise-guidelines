---
name: test-coverage-audit
description: Automated test coverage audit or updates for a behavior, feature, bug, component, endpoint, job, command, policy, hook, or service.
---

# Test Coverage Audit

Prove what is covered before adding tests.
Do not add tests for every touched file, branch, helper, or bug fix. Add tests only when a real uncovered behavior gap remains after tracing existing coverage.

## Workflow

1. Define the target behavior: inputs, outputs, side effects, boundaries, permissions, persistence, integrations, and important failure paths.
2. Trace implementation paths, callers, consumers, routes/screens/commands/jobs, and existing tests before editing.
3. Search with `rg`; use syntax search first when structure matters, such as function calls, component usage, PHP classes/methods, attributes, hooks, imports, or chained calls.
4. Report existing coverage as specific tested behaviors, not just filenames.
5. Identify real gaps: missing happy path, changed behavior, boundary, error, authorization, regression, persistence, integration, or UI state coverage.
6. Discard weak gaps: implementation-only assertions, duplicated coverage, low-risk copy or styling changes, framework behavior, private helpers, and tests that would mostly prove mocks or fixtures.
7. Add or update focused tests that close the remaining gaps using local test style, existing fixtures, and `test-writing`.
8. When no worthwhile gap remains, do not add tests. Say what existing coverage or risk judgment supports that decision.
9. Avoid unrelated test rewrites, broad fixture churn, snapshots without behavioral value, and implementation-detail assertions.

## Large Surfaces

- For broad behavior, split read-only coverage tracing across subagents when available and delegation is allowed.
- Use subagents to map existing coverage and real gaps for separate paths. Do not let them add overlapping tests.
- Keep the main agent responsible for deciding which gaps matter, editing tests, and running the final focused verification.

## Verification

- Discover official test commands from project files and existing docs.
- Run the most focused relevant test target first: file, class, pattern, or suite.
- Run broader tests only when the touched behavior is shared or the local command is cheap enough to be useful.
- Report the exact commands and results.

## Output

- State what is already covered.
- State what was missing.
- State what tests were added or changed.
- State remaining risk only when a meaningful gap remains.
