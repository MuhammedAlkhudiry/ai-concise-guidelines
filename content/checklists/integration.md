# Integration Checklist

## What to Check

### API Contract
- [ ] Request format matches backend expectation
- [ ] Response format matches frontend expectation
- [ ] All required fields are sent
- [ ] Data types match (string vs number, etc.)
- [ ] Nullable fields handled correctly

### Error Handling
- [ ] Frontend handles all error status codes
- [ ] Error messages are user-friendly
- [ ] Validation errors displayed correctly
- [ ] Network failures handled gracefully
- [ ] Retry logic where appropriate

### Data Flow
- [ ] Loading states during API calls
- [ ] Optimistic updates (if used) handle failures
- [ ] Cache invalidation on mutations
- [ ] Real-time updates work (if applicable)
- [ ] Pagination/infinite scroll works

### Authentication
- [ ] Auth tokens sent correctly
- [ ] Token refresh handled
- [ ] Unauthorized responses redirect to login
- [ ] Protected routes enforce auth
- [ ] CORS allows frontend origin

### Edge Cases
- [ ] Empty responses handled
- [ ] Large payloads handled
- [ ] Concurrent requests handled
- [ ] Race conditions prevented
- [ ] Offline behavior defined

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | API contract mismatch (500s), auth not working, data not saving |
| **Should Fix** | Missing error handling, no loading states, validation errors not shown |
| **Minor** | Could optimize request batching, minor UX improvements |

---

## Common Issues

### Type Mismatch
```typescript
// Backend returns
{ "id": 123, "price": "99.99" }  // price is string

// Frontend expects
interface Product {
  id: number;
  price: number;  // MISMATCH - will fail arithmetic
}

// FIX - parse or update contract
const product = { ...data, price: parseFloat(data.price) };
```

### Missing Error Handling
```typescript
// BAD - no error handling
const data = await fetch('/api/users').then(r => r.json());

// GOOD - proper handling
try {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  showToast('Failed to load users');
}
```

### Race Condition
```typescript
// BAD - race condition
const handleSearch = (query: string) => {
  fetch(`/api/search?q=${query}`)
    .then(r => r.json())
    .then(setResults);  // Older request might finish after newer
};

// GOOD - abort previous
const controller = useRef<AbortController>();
const handleSearch = (query: string) => {
  controller.current?.abort();
  controller.current = new AbortController();
  fetch(`/api/search?q=${query}`, { signal: controller.current.signal })
    .then(r => r.json())
    .then(setResults);
};
```

### Missing Validation Display
```typescript
// BAD - generic error
if (error.status === 422) {
  showToast('Validation failed');
}

// GOOD - field-specific errors
if (error.status === 422) {
  const errors = await error.json();
  setFieldErrors(errors.errors);  // { email: ['Invalid email'] }
}
```

---

## Rules

1. **Contract first** — Agree on API shape before building
2. **Type everything** — Shared types between frontend/backend
3. **Handle every state** — Loading, success, error, empty
4. **Test the seams** — Integration tests at API boundaries
5. **Log requests** — Both sides, for debugging
