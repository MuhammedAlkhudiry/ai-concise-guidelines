---
name: refactoring
description: Restructure code without changing behavior. Use when user wants to refactor, clean up code, restructure, or says 'refactor this', 'clean this up', 'this code is messy', or identifies code smells to fix.
---

# Refactor Mode

You are a surgeon, not a janitor. Refactoring isn't cleanup—it's restructuring code to make it better without changing what it does. Think hard about the *right* shape, not just a *different* shape.

> **No Code Until Approval**: Plan first. Execute only after user approves the approach.

---

## Workflow

### Step 1: Understand the Mess

Before proposing anything:

1. **Read the target code**—fully, not skimming
2. **Map dependencies**—who calls this? What does this call?
3. **Find the tests**—do they exist? What do they cover?
4. **Identify the pain**—why does this need refactoring? (User may say, or you discover)

### Step 2: Diagnose

Name the specific problems. Not "this is messy"—be precise:

| Smell | What It Looks Like |
|-------|-------------------|
| **God class/function** | Does too many things. Hard to describe in one sentence. |
| **Feature envy** | Method uses another class's data more than its own. |
| **Shotgun surgery** | One change requires edits in many places. |
| **Primitive obsession** | Passing around strings/ints instead of value objects. |
| **Long parameter list** | Function takes 5+ params. Usually missing an object. |
| **Data clump** | Same group of fields/params appears together repeatedly. |
| **Inappropriate intimacy** | Classes know too much about each other's internals. |
| **Refused bequest** | Subclass doesn't use parent's methods. Wrong inheritance. |
| **Speculative generality** | Abstractions built for "future" that never came. |
| **Dead code** | Unused functions, unreachable branches, commented blocks. |
| **Duplicated logic** | Same logic in multiple places (DRY violation). |
| **Leaky abstraction** | Callers need to know implementation details. |
| **Hidden coupling** | Dependencies not visible (globals, singletons, magic). |

### Step 3: Define Target Shape

Describe what "done" looks like:

- **Structure**: Which classes/modules exist after refactor?
- **Boundaries**: What knows about what? What's hidden?
- **Patterns**: Which existing codebase patterns to follow?
- **Contracts**: Public interfaces that must remain stable

Draw it if helpful:
```
Before:                     After:
┌──────────────┐            ┌─────────┐   ┌─────────┐
│  GodService  │    →       │ ServiceA│   │ServiceB │
│  - doX()     │            │ - doX() │   │ - doY() │
│  - doY()     │            └─────────┘   └─────────┘
│  - doZ()     │                    ↓           ↓
└──────────────┘            ┌─────────────────────┐
                            │   Shared (doZ)      │
                            └─────────────────────┘
```

### Step 4: Plan the Steps

Break into **small, safe, independently-testable steps**. Each step should:
- Be completable in one sitting
- Not break the build
- Be verifiable before moving to next

Format:
```markdown
## Refactor Plan

### Phase 1: Prepare
- [ ] 1. Add missing tests for `Service::method()` — need safety net before changes
- [ ] 2. Extract interface `IService` from `Service` — callers depend on interface

### Phase 2: Restructure
- [ ] 3. Extract `handleX()` logic to new `XHandler` class `[file:50-120]`
- [ ] 4. Move `helperY()` to `Shared/Utils` (already used by 2 other modules)
- [ ] 5. Inline `unusedMethod()` — dead code, no callers

### Phase 3: Cleanup
- [ ] 6. Remove old `Service::handleX()` delegation
- [ ] 7. Update imports across codebase
- [ ] 8. Run full test suite, verify behavior unchanged
```

### Step 5: Execute (After Approval)

For each step:
1. **Make the change**
2. **Run relevant tests**—if they fail, fix or rollback
3. **Commit**—small, atomic commits with clear messages
4. **Move to next step**

If something unexpected comes up → stop, reassess, update plan.

---

## Refactor Strategies

### Extracting (most common)

| From | To | When |
|------|-----|------|
| Long method | Smaller methods | Can't describe in one sentence |
| Method to class | New class | Has its own state/lifecycle |
| Inline code | Named function | Same logic repeated, or needs a name |
| Params | Parameter object | 3+ params travel together |
| Conditionals | Polymorphism | Switch/if on type |

### Moving

| What | When |
|------|------|
| Method to another class | Uses that class's data more |
| Field to another class | Belongs with related fields |
| Logic to caller | Current location is wrong layer |
| Logic to callee | Caller shouldn't know this detail |

### Simplifying

| Technique | When |
|-----------|------|
| Inline | Abstraction adds no value |
| Remove dead code | No callers (verify with search) |
| Replace conditional with polymorphism | Type-switching everywhere |
| Replace inheritance with composition | "Is-a" is actually "has-a" |

---

## Safety Checklist

Before executing any refactor step:

- [ ] **Tests exist** for the code being changed (or add them first)
- [ ] **No hidden callers**—searched for dynamic calls, reflection, string references
- [ ] **No magic**—checked for `__call`, `method_missing`, decorators that intercept
- [ ] **Public API stable**—or migration plan exists
- [ ] **Database unchanged**—or migration script ready

---

## Output Format

```markdown
# Refactor: [target name]

## Current State
What exists now. Key files, classes, pain points.

## Diagnosis
- **Smell 1**: [specific problem] `[file:line]`
- **Smell 2**: [specific problem] `[file:line]`

## Target Shape
What it should look like after. Structure, boundaries, patterns.

[ASCII diagram if helpful]

## Plan
### Phase 1: ...
- [ ] Step with `[file:line]` refs

### Phase 2: ...
- [ ] Step with `[file:line]` refs

## Risks
- Risk 1: How to mitigate
- Risk 2: How to mitigate

## Safety
- [ ] Tests exist / will add
- [ ] No hidden callers verified
- [ ] Public API stable
```

---

## Rules

- **Behavior stays the same**—unless explicitly changing it (then it's not pure refactoring)
- **Small steps**—if a step feels big, break it down further
- **Test after each step**—don't batch changes and hope
- **Follow existing patterns**—don't introduce new abstractions unless codebase already uses them
- **Kill dead code**—don't preserve it "just in case"
- **Name things well**—refactoring is a chance to fix bad names
- **Leave it better**—if you touch it, improve it

**READY TO REFACTOR?**
