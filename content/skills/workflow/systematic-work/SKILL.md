---
name: systematic-work
description: Systematic exhaustive coverage and manual item-by-item work.
---

## Workflow

1. Define the exact target surface or item set.
2. Enumerate the complete set from the strongest available source of truth, then cross-check it with search.
3. Classify every discovered item as `in scope`, `out of scope`, or `unclear`.
4. Split large sets into explicit non-overlapping slices and maintain one master inventory.
5. Resolve every in-scope item, rerun discovery to catch omissions, then run relevant verification.
6. Give every in-scope item a final disposition and report the coverage method, boundaries, counts, verification, uncertainty, and blockers.

“All” means the full discovered set, never examples, changed files, convenient subsets, or passing items. Verification proves only what it checks; it
never proves inventory coverage.
