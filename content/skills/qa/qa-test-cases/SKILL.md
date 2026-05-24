---
name: qa-test-cases
description: "Generate executable QA test cases for user flows and end-to-end scenarios."
---

# QA Test Cases

Write observable QA cases that humans can run or automation can translate directly.

## Workflow

1. Read the relevant code, tests, user story, and integrations.
2. Map flows, branches, permissions, limits, and failure paths.
3. Group by category and priority.
4. Cover happy path, negative cases, boundaries, and security where relevant.

## Template

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

- Use status markers: `[ ]` not run, `[P]` pass, `[F]` fail, `[B]` blocked, `[S]` skipped.
- Structure the document as feature summary, test scope, cases by category, test data, risks, and notes.
- Keep cases executable by a human or directly translatable into automation.

## Rules

- Make steps observable and specific.
- State exact expected results.
- Do not include implementation code.
- Reflect business impact in priority, not test complexity.
