---
name: test-coverage-audit
description: Automated test coverage audit or updates for a behavior, feature, bug, component, endpoint, job, command, policy, hook, or service.
---

Prove coverage as specific behaviors before deciding whether a gap remains.

## Workflow

1. Define the target behavior: inputs, outputs, side effects, boundaries, permissions, persistence, integrations, and important failure paths.
2. Trace implementation paths, callers, consumers, routes/screens/commands/jobs, and existing tests.
3. Use structural search when text results are ambiguous around calls, component usage, classes, methods, hooks, imports, or chains.
4. Report existing coverage as specific tested behaviors, not just filenames.
5. Identify real gaps: missing happy path, changed behavior, boundary, error, authorization, regression, persistence, integration, or UI state coverage.
6. Discard weak gaps: implementation-only assertions, duplicated coverage, low-risk copy/styling, framework behavior, private helpers, and mock/fixture-only tests.
7. For audit requests, report the worthwhile gaps and stop.
8. For update requests, add or update focused tests for the remaining gaps using existing fixtures and $test-writing.
9. When no worthwhile gap remains, say what coverage or risk judgment supports that.

## Rules

- For repo-wide or directory-wide audits, use $deep-work systematic mode.
- Discover official test commands from project files and existing docs.
- Run the most focused relevant test target first: file, class, pattern, or suite.
- Run broader tests only when the touched behavior is shared or the local command is cheap enough to be useful.
- Report the exact commands and results.
- State what is already covered.
- State what was missing.
- For update requests, state what tests were added or changed.
- State remaining risk only when a meaningful gap remains.
