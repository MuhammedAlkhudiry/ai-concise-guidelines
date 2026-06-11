# QA Test Cases

Create deep, risk-based QA suites that humans can run and automation can translate directly. Do not stop at smoke coverage unless the user explicitly asks for smoke tests.

## Workflow

1. Read `qa-test-cases/deep-qa-suite.md`.
2. Read the relevant product request, code, routes/screens, tests, permissions, data model, feature flags, jobs, notifications, analytics, and integrations.
3. Identify roles, entry points, state transitions, durable side effects, async behavior, external systems, limits, and recovery paths.
4. Build a coverage map before writing cases: happy paths, alternate paths, validation, permissions, empty states, boundaries, concurrency, persistence, notifications, auditability, security, accessibility, responsive behavior, and regression risks.
5. Prioritize by user/business impact, data loss risk, security risk, revenue or workflow blockage, and likelihood of breakage.
6. Write executable cases with concrete test data, observable steps, exact expected results, and cleanup/reset needs.

## Output

- Use status markers: `[ ]` not run, `[P]` pass, `[F]` fail, `[B]` blocked, `[S]` skipped.
- Structure output as feature summary, assumptions, scope, coverage map, test data, cases by category, automation candidates, risks/gaps, and notes.
- Start with a coverage map table showing area, risk, and case IDs.
- Group cases by workflow or risk area, not implementation file.
- Keep IDs stable and sequential, grouped by feature prefix when useful, such as `TC-BILLING-001`.
- Call out missing context or untestable areas as risks/gaps instead of silently skipping them.
