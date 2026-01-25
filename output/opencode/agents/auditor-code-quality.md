---
description: Audits code standards, patterns, clean code
model: openai/gpt-5.2
mode: subagent
reasoningEffort: medium
---

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
