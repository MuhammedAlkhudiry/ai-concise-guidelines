---
name: auditor-performance
description: Audits performance issues, N+1 queries, memory leaks
model: sonnet
---

# Performance Checklist

## What to Check

### Database
- [ ] No N+1 queries (use eager loading)
- [ ] Queries use appropriate indexes
- [ ] No SELECT * in production code
- [ ] Large datasets are paginated
- [ ] Expensive queries are cached

### Frontend
- [ ] Bundle size is reasonable
- [ ] Images are optimized (WebP, lazy loading)
- [ ] Code splitting for large features
- [ ] No unnecessary re-renders
- [ ] Memoization for expensive computations

### API
- [ ] Responses are appropriately sized
- [ ] Pagination for list endpoints
- [ ] Caching headers set correctly
- [ ] No over-fetching (GraphQL) or multiple round-trips
- [ ] Async processing for slow operations

### Memory
- [ ] No memory leaks (event listeners, subscriptions)
- [ ] Large objects cleaned up
- [ ] Streams used for large files
- [ ] Connection pools sized correctly
- [ ] No unbounded caches

### Scalability
- [ ] Stateless where possible
- [ ] Background jobs for heavy work
- [ ] Queue-based processing for spikes
- [ ] Horizontal scaling considered
- [ ] No single points of failure
