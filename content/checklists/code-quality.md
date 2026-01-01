# Code Quality Checklist

## What to Check

### Pattern Consistency
- [ ] Follows existing project patterns
- [ ] Naming conventions match codebase
- [ ] File structure matches project layout
- [ ] Import style consistent
- [ ] Error handling pattern consistent

### Clean Code
- [ ] Functions are small and focused
- [ ] Single responsibility per function/class
- [ ] No deep nesting (max 3 levels)
- [ ] Clear, descriptive naming
- [ ] No magic numbers/strings

### Code Hygiene
- [ ] No dead code or commented blocks
- [ ] No debug statements (console.log, dd, print)
- [ ] No TODOs or FIXMEs left behind
- [ ] No hardcoded values that should be config
- [ ] No duplicate code (DRY)

### Maintainability
- [ ] Code is self-documenting
- [ ] Complex logic has comments explaining WHY
- [ ] Public APIs have documentation
- [ ] Dependencies are justified
- [ ] No tight coupling

### Type Safety
- [ ] Types are explicit (no `any`)
- [ ] Null/undefined handled properly
- [ ] Return types declared
- [ ] Props/parameters typed
- [ ] No type assertions without reason

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | Major pattern violation, security issue, broken abstraction |
| **Should Fix** | Debug code left in, dead code, unclear naming, missing types |
| **Minor** | Could be cleaner, minor style preference, optimization opportunity |

---

## Common Issues

### Deep Nesting
```typescript
// BAD - deep nesting
if (user) {
  if (user.permissions) {
    if (user.permissions.includes('admin')) {
      if (isValidRequest(request)) {
        // finally do something
      }
    }
  }
}

// GOOD - early returns
if (!user) return;
if (!user.permissions) return;
if (!user.permissions.includes('admin')) return;
if (!isValidRequest(request)) return;
// do something
```

### Magic Numbers
```typescript
// BAD - what is 86400?
const expiry = Date.now() + 86400 * 1000;

// GOOD - named constant
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const expiry = Date.now() + ONE_DAY_MS;
```

### Unclear Naming
```typescript
// BAD - unclear
const d = new Date();
const fn = (x: number) => x * 2;
const data = await fetch('/api/users');

// GOOD - descriptive
const createdAt = new Date();
const doublePrice = (price: number) => price * 2;
const userResponse = await fetch('/api/users');
```

### Any Type
```typescript
// BAD - loses type safety
function process(data: any): any {
  return data.items.map((x: any) => x.name);
}

// GOOD - typed
interface DataResponse {
  items: Array<{ name: string }>;
}
function process(data: DataResponse): string[] {
  return data.items.map(x => x.name);
}
```

---

## Rules

1. **Match the codebase** — Consistency over preference
2. **No dead code** — Delete it, git remembers
3. **Names reveal intent** — If you need a comment, rename
4. **Small functions** — If it doesn't fit on screen, split it
5. **Type everything** — Future you will thank you
