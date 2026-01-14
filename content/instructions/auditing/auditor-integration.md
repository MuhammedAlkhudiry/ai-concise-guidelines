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
