---
name: code-simplifier
description: Post-implementation code and test simplification.
---

## Workflow

1. Use the requested scope or the current `git diff`, then trace every affected caller, consumer, test, configuration, and contract.
2. Delete everything without a current job: dead, duplicated, obsolete, incidental, or speculative code. Inline wrappers, aliases, one-use
   abstractions, and unnecessary temporary values.
3. Flatten nesting and never introduce nested ternaries.
4. Do not stop at cosmetic cleanup. Rebuild the simplest direct version, moving, merging, or splitting files when needed. Preserve observable outputs,
   side effects, and real contracts—not incidental structure.
5. Use $react for React changes and $test-writing when changing tests.
