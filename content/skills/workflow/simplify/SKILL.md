---
name: simplify
description: Post-implementation code, test, architecture, product, and UX simplification through safe changes and suggested follow-up.
---

## Workflow

1. Use the requested scope or the current `git diff`, then trace every affected caller, consumer, test, configuration, contract, and user journey.
2. Apply in-scope simplifications when observable behavior, side effects, operational characteristics, and real contracts can be preserved with
   sufficient evidence. Delete dead, duplicated, obsolete, incidental, or speculative code; inline wrappers, aliases, one-use abstractions, and
   unnecessary temporary values.
3. Flatten nesting and never introduce nested ternaries. Do not stop at cosmetic cleanup; rebuild the simplest direct version, moving, merging, or
   splitting files when needed. Move decisions to the simplest sufficient ownership level; reconsider whether environment-driven, configurable,
   constant, shared, or abstracted values can be more local and direct.
4. Report rather than apply sound simplifications that change behavior, cross contracts, expand scope, require migration, introduce a meaningful
   trade-off, or cannot be sufficiently verified. Consider every relevant angle, including code, tests, architecture, operations, product, and UX.
   Exclude style preferences, generic cleanup, speculative abstractions, and unsupported product guesses.
5. Classify each suggestion as `Recommended` or `Optional`, then report its area, affected files or flow, proposed simplification, expected benefit,
   reason it was not applied, capability or flexibility potentially lost, supporting evidence, and required decision or validation. If none exist,
   report `No suggested simplifications found`.
6. Use $react for React changes and $test-writing when changing tests. After approval, use $workshop for unresolved product decisions and $ux-ui for
   product or UX changes.
