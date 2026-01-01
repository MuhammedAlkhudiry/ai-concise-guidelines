# Refactoring Checklist

## What to Detect

### Duplication
- [ ] Copy-pasted code blocks
- [ ] Similar functions that could be merged
- [ ] Repeated patterns across files
- [ ] Same logic in different formats
- [ ] Configuration that could be centralized

### Complexity
- [ ] Functions doing too much
- [ ] Deep nesting (> 3 levels)
- [ ] Long parameter lists (> 4 params)
- [ ] Complex conditionals
- [ ] God classes/files

### Tech Debt
- [ ] Outdated patterns (new patterns exist)
- [ ] Workarounds that should be fixed
- [ ] TODOs and FIXMEs accumulated
- [ ] Dead code paths
- [ ] Unused dependencies

### Abstraction Issues
- [ ] Missing abstractions (repeated concepts)
- [ ] Over-abstraction (premature generalization)
- [ ] Leaky abstractions
- [ ] Wrong level of abstraction
- [ ] Inconsistent abstraction layers

### Naming
- [ ] Unclear or misleading names
- [ ] Inconsistent naming conventions
- [ ] Abbreviations that obscure meaning
- [ ] Names that don't match behavior
- [ ] Generic names (data, info, utils)

---

## Severity Levels

| Level | Action |
|-------|--------|
| **Immediate** | Fix now (blocks this PR) — critical duplication, dangerous complexity |
| **Soon** | Add to sprint — significant tech debt, maintainability risk |
| **Backlog** | Track for later — minor improvements, nice-to-haves |

---

## Output Format

When you find refactoring opportunities, report:

```markdown
## Refactoring Opportunities

### Immediate (fix in this PR)
| Issue | Location | Suggestion |
|-------|----------|------------|
| Duplicated validation | `UserController.php:45`, `OrderController.php:67` | Extract to `ValidatesRequest` trait |

### Soon (add to sprint)
| Issue | Location | Suggestion |
|-------|----------|------------|
| God class | `PaymentService.php` (500+ lines) | Split into `PaymentProcessor`, `RefundHandler`, `PaymentValidator` |

### Backlog
| Issue | Location | Suggestion |
|-------|----------|------------|
| Could use constants | `config.ts:12-20` | Extract magic strings to enum |
```

---

## Common Patterns

### Duplicated Logic
```typescript
// BEFORE - duplicated
function createUser(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  // ... create user
}
function updateUser(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  // ... update user
}

// AFTER - extracted
function validateEmail(email: string): void {
  if (!email || !email.includes('@')) throw new Error('Invalid email');
}
```

### Complex Conditional
```typescript
// BEFORE - complex
if (user.role === 'admin' || (user.role === 'manager' && user.department === 'sales') || user.permissions.includes('override')) {
  // allow action
}

// AFTER - extracted
function canPerformAction(user: User): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && user.department === 'sales') return true;
  if (user.permissions.includes('override')) return true;
  return false;
}
```

### Long Parameter List
```typescript
// BEFORE - too many params
function createOrder(userId, productId, quantity, price, discount, shipping, tax, notes) {}

// AFTER - object param
interface CreateOrderParams {
  userId: string;
  productId: string;
  quantity: number;
  pricing: { price: number; discount: number; tax: number };
  shipping: ShippingInfo;
  notes?: string;
}
function createOrder(params: CreateOrderParams) {}
```

---

## Rules

1. **Don't refactor while implementing** — Finish feature first, then refactor
2. **Small steps** — One refactoring at a time, tests passing between
3. **Justify the change** — Every refactoring should have clear benefit
4. **Track, don't block** — Note backlog items, don't derail current work
5. **Tests first** — Ensure tests exist before refactoring
