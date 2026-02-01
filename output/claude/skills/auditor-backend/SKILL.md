---
name: auditor-backend
description: Audit backend code quality, performance, database, and security. Typically loaded by the audit-orchestrator skill via sub-agents, but can be used standalone.
---

# Backend Checklist

## Verification Patterns (Stub Detection)

Before checking code quality, verify implementations are real — not stubs or placeholders.

**Principle: Existence ≠ Implementation.** A file existing does not mean the feature works.

### 4-Level Verification

| Level | Check | How |
|-------|-------|-----|
| **Exists** | File is at expected path | File check |
| **Substantive** | Real implementation, not placeholder | Check for TODO/placeholder/empty returns, verify meaningful line count |
| **Wired** | Connected to the rest of the system | Imports resolve, called from somewhere, route registered |
| **Functional** | Actually works when invoked | Tests pass, endpoint returns real data |

### Red Flags (auto-fail)

- Functions that return `null`, `{}`, `[]`, or hardcoded data without querying a data source
- Handlers that only `console.log` or only call `preventDefault()`
- Files under 10 lines that claim to implement real features
- `TODO`, `FIXME`, `placeholder`, `not implemented` in implementation code
- API routes that return static responses without database/service calls
- Queries that exist but whose results aren't returned in the response
- Awaited calls whose results are never used

### Wiring Checks

- **Route → Handler:** Route file exists AND handler has real logic AND route is registered
- **Handler → Database:** Handler queries DB/service AND uses the result in response
- **Validation → Handler:** Input validation exists AND is wired to the handler (not just defined)
- **Middleware → Route:** Auth/permission middleware applied AND actually checks credentials

---

## Code Quality

### Pattern Consistency
- [ ] Service/repository/controller separation matches codebase
- [ ] Naming conventions match existing code (methods, variables, classes)
- [ ] File/folder structure follows project layout
- [ ] Import ordering and grouping consistent
- [ ] Error handling pattern matches existing (exceptions, error responses)
- [ ] Logging pattern consistent (levels, format, context)
- [ ] API response format matches existing endpoints
- [ ] Validation approach matches existing (Form Requests, inline, etc.)
- [ ] Query patterns match (Eloquent vs raw, eager loading style)

### Clean Code
- [ ] Functions are small and focused (single responsibility)
- [ ] No deep nesting (max 3 levels, use early returns)
- [ ] No magic numbers/strings (use constants/config)

### Code Hygiene
- [ ] No hardcoded values that should be config/env

### Maintainability
- [ ] Complex logic has comments explaining WHY (not what)
- [ ] Public APIs/methods have docblocks
- [ ] Dependencies are justified (no unnecessary packages)
- [ ] No tight coupling (use interfaces, dependency injection)

### Type Safety
- [ ] PHP type declarations on parameters and returns
- [ ] Null handling explicit (nullable types, null checks)
- [ ] No mixed types without reason
- [ ] PHPDoc for complex types (arrays, generics)

---

## Performance

### Database Queries
- [ ] No N+1 queries (use eager loading)
- [ ] Queries use appropriate indexes
- [ ] No SELECT * in production code
- [ ] Large datasets are paginated
- [ ] Expensive queries are cached

### API
- [ ] Responses are appropriately sized
- [ ] Pagination for list endpoints
- [ ] Caching headers set correctly
- [ ] No over-fetching or multiple round-trips
- [ ] Async processing for slow operations

### Memory & Scalability
- [ ] No memory leaks (event listeners, subscriptions)
- [ ] Streams used for large files
- [ ] Connection pools sized correctly
- [ ] No unbounded caches
- [ ] Stateless where possible
- [ ] Background jobs for heavy work

---

## Database

### Migrations
- [ ] Migration is reversible (has down method)
- [ ] No data loss on rollback
- [ ] Large tables use batching
- [ ] Locks minimized (avoid long-running migrations)

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

### Data Integrity
- [ ] Constraints enforce business rules
- [ ] Cascading deletes considered carefully
- [ ] Soft deletes where appropriate
- [ ] No orphaned records possible

### Query Safety
- [ ] Parameterized queries (no SQL injection)
- [ ] Transactions for multi-step operations
- [ ] Deadlock prevention considered
- [ ] Timeouts set for long queries

---

## Security

### Input Validation
- [ ] All user input is validated server-side
- [ ] Input length limits enforced
- [ ] Input types validated (email, URL, etc.)
- [ ] File uploads validated (type, size, content)

### Injection Prevention
- [ ] SQL queries use parameterized statements
- [ ] No raw SQL string concatenation
- [ ] HTML output is escaped (XSS prevention)
- [ ] Command injection prevented

### Authentication & Authorization
- [ ] Authentication required for protected routes
- [ ] Authorization checked for each action
- [ ] No privilege escalation possible
- [ ] Session handling is secure

### Secrets & Data
- [ ] No secrets in code (API keys, passwords)
- [ ] Secrets in environment variables
- [ ] Sensitive data encrypted at rest
- [ ] PII handled according to policy
- [ ] No sensitive data in logs

### API Security
- [ ] Rate limiting in place
- [ ] CORS configured correctly
- [ ] CSRF protection enabled
- [ ] API responses don't leak internal details
