---
name: code-simplifier
description: Code and test simplification after implementation or refactor, including cleanup, complexity reduction, brittle tests, and overgrown files.
---

## Workflow

1. If no scope is specified, use the current `git diff`.
2. Trace touched files, callers, consumers, tests, imports, exports, config, and contracts.
3. Remove anything unreferenced, unreachable, superseded, duplicated, obsolete, or incidental:
   dead code, stale branches, obsolete helpers, compatibility leftovers, comments about removed logic,
   and one-off abstractions. For every line, ask whether it still has a job.
4. Apply the $code-principles solution ladder, then collapse indirection and rebuild the clearest
   version that preserves outputs, side effects, and real contracts—not incidental structure.
   Inline wrappers, aliases, pass-through helpers, one-use values, useless temporary variables,
   and aliased destructuring; flatten nesting with early returns and guard clauses, never nested ternaries.
5. Load $react for React-specific cleanup and $test-writing for test deletion, merging, or rewriting decisions.
6. Refactor related tests with app code when removal or rewriting is clearly safe.
7. Create, move, split, or merge files when the simple end state needs it, then run $verification, fix task-related fallout, and report simplifications, protected behavior, unsafe deletions, and kept complexity.
