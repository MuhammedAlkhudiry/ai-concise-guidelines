---
name: refactor-opportunities
description: Refactor opportunity reports without edits after implementation, cleanup, branch sync, conflict resolution, review, or what-to-refactor prompts.
---

## Workflow

1. Inspect the actual diff, touched files, nearby callers, tests, data contracts, routes, screens, jobs, and config that matter to the change.
2. Separate real structural opportunities from style preferences and generic cleanup. Look for standard
   or existing APIs replacing custom code, duplicated behavior needing a real boundary, wrong ownership,
   dead compatibility paths, manually recreated local helpers, brittle tests, hidden coupling,
   misleading names, long functions, nesting, or parameter clutter.
3. Classify opportunities as `Recommended` for meaningful clarity, safety, maintainability, or product
   leverage, or `Optional` for real but lower-value cleanup. Prefer fewer high-signal items, do not
   propose abstractions without real pressure, and treat obsolete compatibility as a cost.
4. For each item, name the concrete code smell, affected files, impact, likely effort or risk, and
   safest next move. Include size, tests, or verification only when useful—not as a scope gate; say
   `No worthwhile refactor opportunities found` when nothing merits inclusion.

Report only the sections that apply: `Recommended`, `Optional`, or `No worthwhile refactor opportunities found`.
