---
name: test-coverage-audit
description: Audit and update automated test coverage for a specific behavior, feature, bug, component, endpoint, job, command, policy, hook, or service. Use when the user asks "ensure test coverage for X", "what test coverage do we have for X", "do we have tests for X", "audit test coverage of X", or "add missing tests around X".
---

# Test Coverage Audit

Prove what is covered before adding tests.

## Workflow

1. Define the target behavior in concrete terms: inputs, outputs, side effects, boundaries, permissions, persistence, integrations, and failure paths that matter.
2. Trace implementation paths, callers, consumers, routes/screens/commands/jobs, and existing tests before editing.
3. Search with `rg`; use syntax search first when structure matters, such as function calls, component usage, PHP classes/methods, attributes, hooks, imports, or chained calls.
4. Report existing coverage as specific tested behaviors, not just filenames.
5. Identify real gaps: missing happy path, changed behavior, boundary, error, authorization, regression, persistence, integration, or UI state coverage.
6. Add or update the smallest focused tests that close those gaps using local test style and existing fixtures.
7. Avoid unrelated test rewrites, broad fixture churn, snapshots without behavioral value, and implementation-detail assertions.

## Verification

- Discover official test commands from project files and existing docs.
- Run the smallest relevant test target first: file, class, pattern, or suite.
- Run broader tests only when the touched behavior is shared or the local command is cheap enough to be useful.
- Report the exact commands and results.

## Output

- State what is already covered.
- State what was missing.
- State what tests were added or changed.
- State remaining risk only when a meaningful gap remains.
