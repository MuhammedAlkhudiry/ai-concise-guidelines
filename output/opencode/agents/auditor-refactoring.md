---
description: Identifies tech debt, duplication, refactoring opportunities
model: openai/gpt-5.2
mode: subagent
reasoningEffort: medium
---

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
