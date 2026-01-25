---
description: Audits state management, data flow, re-renders, normalization
model: openai/gpt-5.2
mode: subagent
reasoningEffort: low
---

# State Management Checklist

## What to Check

### State Location
- [ ] State lives at the right level (not too high, not too low)
- [ ] Server state vs client state separated
- [ ] URL is source of truth for navigation state
- [ ] Form state is local unless needed elsewhere
- [ ] No duplicate state (derived data stored separately)

### Data Flow
- [ ] No prop drilling beyond 2-3 levels
- [ ] Context used for truly global state only
- [ ] Data flows one direction (parent → child)
- [ ] Side effects are explicit and traceable
- [ ] No hidden state mutations

### Performance
- [ ] No unnecessary re-renders from state changes
- [ ] Large lists are virtualized or paginated
- [ ] Expensive computations are memoized
- [ ] Selectors used for derived state
- [ ] State updates are batched where possible

### Data Fetching
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Stale data strategy defined (refetch, cache)
- [ ] Race conditions prevented (abort, latest-only)
- [ ] Optimistic updates rollback on failure

### Normalization
- [ ] Relational data is normalized (no nested duplicates)
- [ ] Entities stored by ID in lookup objects
- [ ] References use IDs, not nested objects
- [ ] Updates happen in one place
- [ ] No stale references after updates

### Persistence
- [ ] Persisted state handles schema changes
- [ ] Sensitive data not stored in localStorage
- [ ] Hydration doesn't cause flicker
- [ ] Clear distinction: ephemeral vs persistent state
- [ ] Cache invalidation strategy exists
