---
name: refactor-opportunities
description: Post-change refactor opportunity reports without edits.
---

## Workflow

1. Use the requested scope or current diff, then inspect the relevant callers, tests, and contracts.
2. Report only structural opportunities supported by concrete pressure. Exclude style preferences, generic cleanup, and speculative abstractions.
3. Classify each item as `Recommended` or `Optional`.
4. For each item, name the affected files, structural problem, impact.
5. If nothing is worthwhile, report `No worthwhile refactor opportunities found`.
