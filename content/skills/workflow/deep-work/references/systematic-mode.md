# Systematic Mode

Use this for broad-scope requests where the user expects every matching item to be found, checked, changed, listed, migrated, or made consistent.

## Inventory

Prefer source-of-truth inventories: route maps, exported schemas, test discovery, package manifests, generated indexes, framework commands, database queries, or structured APIs.

Use search to supplement and cross-check, not as proof when stronger enumeration exists.

Do not rely on examples when the user asked for all of something. Passing tests, lint, typecheck, build, or smoke checks prove only that those checks pass.

## Large Surfaces

- Split large confirmed sets into explicit non-overlapping slices.
- Use explorer subagents for inventory, classification, and coverage checks when delegation is allowed.
- Use worker subagents only when edit scopes are disjoint and easy to merge.
- Keep the main agent responsible for the master inventory, ambiguous items, final coverage check, and report.
- Keep a master list or equivalent record for large surfaces. Do not rely on memory.

## Strictness

- Do not reduce an "all" request to changed files, recent files, easy files, or examples unless the user narrows the scope.
- Do not skip green, passing, or apparently fine items when the task is an audit.
- Do not batch ambiguous items into a vague note. Decide, investigate, or mark each one `unclear`.
- Do not hide skipped work behind time, context, or confidence. Name what was skipped and why.
- Do not use verification commands as a substitute for inventory, classification, or per-item work.
