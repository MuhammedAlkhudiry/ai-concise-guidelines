---
name: manual-work
description: Manual judgment-heavy work for one-by-one handling, hand review, careful repeated changes, or explicit requests to avoid scripting or broad automation.
---

# Manual Work

Handle sensitive repeated work item by item.

## Contract

1. Use search or structured tooling to build the working set.
2. Inspect each item before changing it.
3. Do the work manually, one item or tight group at a time.
4. Avoid broad scripts, generated codemods, and bulk transformations unless the user approves them.
5. Re-check the working set after editing.
6. Report what was changed, skipped, and still uncertain.

## When To Apply

Use this when correctness depends on local meaning, human judgment, or per-item context.

Manual work still uses search, type checks, tests, formatters, and targeted commands when they prove coverage or verify the result.

## Working Style

Keep the active set visible. For each item, decide whether it is:

- `change`: in scope and safe to edit now.
- `skip`: similar text but intentionally untouched.
- `unclear`: needs more context before changing.

If the set is large, work in batches and keep progress clear. Do not convert the task into an automation problem just because the edits are repetitive.
