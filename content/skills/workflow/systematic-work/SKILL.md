---
name: systematic-work
description: Exhaustive repo-wide or set-wide work for checking, listing, changing, updating, or making matching items consistent.
---

# Systematic Work

Handle broad-scope requests by proving coverage. It is not spot checking, sampling, or running verification commands.

## Contract

1. Define the exact set the user asked about.
2. Build a complete inventory that is strong enough for the artifact being changed.
3. Classify every discovered item before broad edits.
4. Work through the confirmed set intentionally, item by item or slice by slice.
5. Re-check the inventory after changes to catch missed, stale, renamed, or generated items.
6. Run the relevant verification only after the systematic pass is complete enough to verify.
7. Report what was included, excluded, handled, skipped, and still uncertain.

Do not claim completion while any in-scope item is unclassified or unresolved. If coverage cannot be proven, name the missing evidence.

## Manual Mode

When the user asks for manual handling, one-by-one review, hand edits, judgment-heavy repeated work, or forbids scripting, automation, shortcuts, or broad transformations, also apply `manual-work`.

Inventory and verification may use search, structured tooling, tests, type checks, formatters, and targeted commands. Inspection and changes must be manual: one item or tight group at a time.

Do not use scripts, codemods, generated edits, bulk transformations, broad automation, worker subagent sweeps, or shortcut handling unless the user explicitly approves after hearing the trade-off.

## Inventory

Choose the inventory method that fits: search, AST tools, framework commands, database queries, generated indexes, tests, or manual review.
Use browser or device inspection when the artifact is visual, interactive, or runtime-only.

Prefer source-of-truth inventories: route maps, exported schemas, test discovery, package manifests, generated indexes, or structured queries.
Use search to supplement and cross-check, not as proof when stronger enumeration exists.

Do not rely on examples when the user asked for all of something. Passing tests, lint, typecheck, build, or smoke checks prove only that those checks pass.

## Large Surfaces

- When the confirmed set is large, split it into explicit non-overlapping slices and use subagents when delegation is allowed.
- Use explorer subagents for inventory, classification, and coverage checks. Use workers only when edit scopes are disjoint and easy to merge.
- Do not use worker subagents when `manual-work` applies unless the user explicitly approves delegation.
- Keep the main agent responsible for the master inventory, ambiguous items, final coverage check, and report.
- Keep a master list or equivalent record for large surfaces. Do not rely on memory.

## Classification

Keep the working set explicit:

- `in scope`: definitely part of the requested set.
- `out of scope`: similar but intentionally excluded.
- `unclear`: needs user confirmation or more evidence before changing.

For each `in scope` item, assign a final disposition: `unchanged`, `changed`, `fixed`, `deleted`, `moved`, `merged`, `verified`, `blocked`, or another explicit status.

## Strictness

- Do not reduce an "all" request to changed files, recent files, easy files, or examples unless the user narrows the scope.
- Do not skip green, passing, or apparently fine items when the task is an audit.
- Do not batch ambiguous items into a vague note. Decide, investigate, or mark each one `unclear`.
- Do not hide skipped work behind time, context, or confidence. Name what was skipped and why.
- Do not use verification commands as a substitute for inventory, classification, or per-item work.

## Reporting

Finish with the coverage result, not a vague summary.
Mention the inventory source, scope boundaries, counts by status, handled set when useful, verification run, and any trust-affecting skipped or uncertain items.
