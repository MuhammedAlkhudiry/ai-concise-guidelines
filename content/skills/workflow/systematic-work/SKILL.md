---
name: systematic-work
description: Exhaustive repo-wide or set-wide work for checking every item, listing all items, changing all matches, updating everything matching a condition, or making something consistent everywhere.
---

# Systematic Work

Handle broad-scope requests by proving coverage, not by sampling and guessing.

## Contract

1. Define the exact set the user asked about.
2. Build an inventory that is strong enough for the artifact being changed.
3. Classify ambiguous items before acting on them.
4. Work through the confirmed set intentionally.
5. Re-check coverage after the work.
6. Report what was included, skipped, and still uncertain.

## Inventory

Choose the inventory method that fits the work. Code search, AST tools, framework commands, database queries, generated indexes, browser inspection, device inspection, tests, or manual review are all valid when they prove the set.

Do not rely on a few examples when the user asked for all of something. If the full set cannot be proven, say what is missing and why.

## Classification

Keep the working set explicit:

- `in scope`: definitely part of the requested set.
- `out of scope`: similar but intentionally excluded.
- `unclear`: needs user confirmation or more evidence before changing.

## Reporting

Finish with the coverage result, not a vague summary. Mention the inventory source, the count or shape of the handled set when useful, and any skipped or uncertain items that affect trust in the result.
