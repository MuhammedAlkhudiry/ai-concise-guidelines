---
description: Audits test coverage, missing cases, edge cases
model: openai/gpt-5.2
mode: subagent
reasoningEffort: low
---

# Test Coverage Checklist

## What to Check

### Critical Paths
- [ ] Happy path tested
- [ ] Main user flows covered
- [ ] Core business logic tested
- [ ] Data transformations verified
- [ ] API endpoints tested

### Edge Cases
- [ ] Empty inputs handled
- [ ] Null/undefined cases covered
- [ ] Boundary values tested (0, -1, max)
- [ ] Invalid inputs rejected
- [ ] Error conditions tested

### Changes Coverage
- [ ] New code has tests
- [ ] Modified code has updated tests
- [ ] Bug fixes include regression tests
- [ ] Deleted code has tests removed
- [ ] Refactored code tests still pass

### Test Quality
- [ ] Tests are deterministic (no flaky)
- [ ] Tests are independent (no order dependency)
- [ ] Tests are fast (no unnecessary waits)
- [ ] Tests are readable (clear arrange-act-assert)
- [ ] Tests use meaningful assertions

### Integration
- [ ] API contract tests exist
- [ ] Database operations tested
- [ ] External service mocks in place
- [ ] Authentication flows tested
- [ ] Error responses tested
