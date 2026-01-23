---
name: auditor-database
description: Audits migrations, schema, indexes, data integrity
model: haiku
---

# Database Checklist

## What to Check

### Migrations
- [ ] Migration is reversible (has down method)
- [ ] No data loss on rollback
- [ ] Large tables use batching
- [ ] Locks minimized (avoid long-running migrations)
- [ ] Tested on production-size data

### Schema Design
- [ ] Appropriate data types chosen
- [ ] Nullable only when necessary
- [ ] Defaults set where appropriate
- [ ] Foreign keys defined
- [ ] Unique constraints where needed

### Indexes
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Composite indexes in correct order
- [ ] No over-indexing (write penalty)
- [ ] Covering indexes for common queries

### Data Integrity
- [ ] Constraints enforce business rules
- [ ] Cascading deletes considered carefully
- [ ] Soft deletes where appropriate
- [ ] Audit trails for sensitive data
- [ ] No orphaned records possible

### Query Safety
- [ ] Parameterized queries (no SQL injection)
- [ ] Transactions for multi-step operations
- [ ] Deadlock prevention considered
- [ ] Connection limits respected
- [ ] Timeouts set for long queries
