---
name: _qa-test-cases
description: "Generate executable QA test cases for user flows and end-to-end scenarios."
---

# QA Test Cases

Write test cases that humans can run or automation can translate directly.

## Workflow

1. Read the relevant code, tests, user story, and integrations.
2. Map the user flow, branches, permissions, limits, and failure paths.
3. Group cases by category and priority.
4. Cover happy path, edge cases, error handling, boundaries, and security where relevant.

## Status Markers

Use:

- `[ ]` not run
- `[P]` pass
- `[F]` fail
- `[B]` blocked
- `[S]` skipped

## Test Case Template

```markdown
### TC-<ID>: <Title> [status]

**Priority**: Critical | High | Medium | Low
**Type**: Happy Path | Edge Case | Error Handling | Boundary | Security | Performance
**Suite**: Smoke | Regression | Full
**Tags**: @feature:<name>, @component:<name>, @integration:<name>

**Preconditions**:
- ...

**Steps**:
1. ...

**Expected Result**:
- ...
```

## Output

Structure the document as:

- Feature summary
- Test scope
- Test cases by category
- Test data requirements
- Risks and notes

## Rules

- Make steps observable and specific.
- Include negative tests.
- State exact expected results.
- Do not include implementation code.
- Reflect business impact in priority, not test complexity.
