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

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | Critical path untested, regression introduced, no tests for new feature |
| **Should Fix** | Edge cases missing, flaky test, test doesn't assert correctly |
| **Minor** | Could add more cases, test naming could be clearer |

---

## What's Missing?

Ask yourself:
- "What if this input is empty?"
- "What if this fails?"
- "What if the user does X before Y?"
- "What happens at the boundaries?"
- "Is this change tested?"

---

## Common Issues

### Missing Edge Case
```typescript
// Function
function divide(a: number, b: number): number {
  return a / b;
}

// BAD - only happy path
test('divides numbers', () => {
  expect(divide(10, 2)).toBe(5);
});

// GOOD - includes edge cases
test('divides numbers', () => {
  expect(divide(10, 2)).toBe(5);
});
test('handles zero divisor', () => {
  expect(divide(10, 0)).toBe(Infinity);
});
test('handles negative numbers', () => {
  expect(divide(-10, 2)).toBe(-5);
});
```

### Untested Error Path
```typescript
// BAD - only success path
test('fetches user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});

// GOOD - includes error path
test('fetches user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});
test('throws on user not found', async () => {
  await expect(fetchUser(999)).rejects.toThrow('User not found');
});
```

### Missing Regression Test
```typescript
// Bug fix: users with special chars in name caused crash
// BAD - just fix the code

// GOOD - add regression test
test('handles special characters in username', () => {
  const user = createUser({ name: "O'Connor" });
  expect(user.displayName).toBe("O'Connor");
});
```

### Flaky Test
```typescript
// BAD - timing dependent
test('shows toast after save', async () => {
  await save();
  await sleep(100);  // Flaky!
  expect(toast).toBeVisible();
});

// GOOD - wait for condition
test('shows toast after save', async () => {
  await save();
  await waitFor(() => expect(toast).toBeVisible());
});
```

---

## Rules

1. **Test behavior, not implementation** — What, not how
2. **One assertion focus per test** — Clear failure messages
3. **Regression tests for bugs** — Prevent re-introduction
4. **Edge cases matter** — Users find them
5. **Fast tests run often** — Slow tests get skipped
