---
name: deep-work
description: Exhaustive coverage work for broad inventories, careful manual item-by-item handling, and deep multi-source search where completion requires proving what was included, excluded, handled, skipped, and still uncertain.
---

# Deep Work

Use this when the task is done only if coverage is defensible. This is not extra effort, spot checking, sampling, or running verification commands.

## Modes

Load only the references that match the current task:

- `references/systematic-mode.md` for repo-wide, set-wide, all-items, audit, migration, consistency, or broad update work.
- `references/manual-mode.md` when the user asks for hand review, one-by-one handling, careful repeated edits, or no scripting/automation.
- `references/deep-search-mode.md` for broad unknown discovery, multi-source research, current external facts, prior art, or unclear evidence quality.

When modes overlap, combine them deliberately. Use deep-search to discover the surface, systematic mode to prove and handle the inventory, and manual mode as an automation constraint.

## Contract

1. Define the exact target surface, item set, or research question.
2. Build an inventory, search map, or source set strong enough for the promised result.
3. Classify every discovered item, source, or finding before broad edits or synthesis.
4. Work through the confirmed set intentionally, item by item, slice by slice, or source class by source class.
5. Re-run discovery after changes or synthesis to catch missed, stale, renamed, generated, or contradictory items.
6. Run relevant verification only after the coverage pass is complete enough to verify.
7. Report what was included, excluded, handled, skipped, and still uncertain.

Do not claim completion while any in-scope item or trust-critical source remains unclassified or unresolved. If coverage cannot be proven, name the missing evidence.

## Classification

Keep the active set visible:

- `in scope`: definitely part of the requested set.
- `out of scope`: similar but intentionally excluded.
- `unclear`: needs user confirmation or more evidence.

For each in-scope item, assign a final disposition such as `unchanged`, `changed`, `fixed`, `deleted`, `moved`, `merged`, `verified`, `synthesized`, or `blocked`.

## Reporting

Finish with coverage evidence, not a vague summary. Mention the inventory or search method, scope boundaries, counts by status when useful, verification run, and any skipped or uncertain work that affects trust.
