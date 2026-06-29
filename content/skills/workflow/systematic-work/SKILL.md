---
name: systematic-work
description: Exhaustive repo-wide or set-wide work for checking, listing, changing, updating, or making every matching item consistent.
---

# Systematic Work

Handle broad-scope requests by proving coverage.

## Contract

1. Define the exact set the user asked about.
2. Build an inventory that is strong enough for the artifact being changed.
3. Classify ambiguous items before acting on them.
4. Work through the confirmed set intentionally.
5. Re-check coverage after the work.
6. Report what was included, skipped, and still uncertain.

## Inventory

Choose the inventory method that fits the work: code search, AST tools, framework commands, database queries, generated indexes, tests, or manual review.
Use browser or device inspection when the artifact is visual, interactive, or runtime-only.

Do not rely on a few examples when the user asked for all of something. If the full set cannot be proven, say what is missing and why.

## Large Surfaces

- When the confirmed set is large, split it into explicit non-overlapping slices and use subagents when available and delegation is allowed.
- Use explorer subagents for inventory, classification, and coverage checks. Use worker subagents only when edit scopes are disjoint and easy to merge.
- Keep the main agent responsible for the master inventory, ambiguous items, final coverage check, and report.

## Classification

Keep the working set explicit:

- `in scope`: definitely part of the requested set.
- `out of scope`: similar but intentionally excluded.
- `unclear`: needs user confirmation or more evidence before changing.

## Reporting

Finish with the coverage result, not a vague summary.
Mention the inventory source, the handled set when useful, and any skipped or uncertain items that affect trust in the result.
