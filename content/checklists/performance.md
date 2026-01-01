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

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | N+1 causing 100+ queries, memory leak crashing server, blocking main thread |
| **Should Fix** | Missing pagination, unoptimized images, redundant API calls |
| **Minor** | Could add caching, minor optimization opportunities |

---

## Common Issues

### N+1 Query
```php
// BAD - N+1 (1 + N queries)
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->author->name; // Query per post
}

// GOOD - Eager loading (2 queries)
$posts = Post::with('author')->get();
foreach ($posts as $post) {
    echo $post->author->name; // Already loaded
}
```

### Missing Pagination
```javascript
// BAD - loads everything
const users = await User.findAll();

// GOOD - paginated
const users = await User.findAll({
  limit: 20,
  offset: page * 20
});
```

### Memory Leak
```javascript
// BAD - listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// GOOD - cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Unbounded Loop
```javascript
// BAD - could be huge
const allItems = items.map(x => expensiveTransform(x));

// GOOD - paginate or stream
const pageItems = items.slice(0, 100).map(x => expensiveTransform(x));
```

---

## Rules

1. **Measure first** — Profile before optimizing
2. **Database is usually the bottleneck** — Check queries first
3. **Lazy load** — Don't load what you don't need
4. **Cache expensive operations** — But invalidate correctly
5. **Set budgets** — Bundle size, query count, response time
