---
name: manage-agent-md
description: AGENTS.md-style instruction files, repo rules, AI coding guidelines, durable context, wording updates, pruning, and review.
---

Manage durable agent instructions as operating rules, not documentation.

## Workflow

1. Find the instruction source before editing. If the visible file is generated, edit the source.
2. Decide whether the request is a new rule, an update, a stale-rule removal, or guidance that belongs in a narrower skill, script, checklist, or project doc.
3. Keep each rule single-purpose, direct, actionable, current, testable, and non-duplicative.
4. Replace stale instructions instead of layering exceptions.
5. Move task-specific workflow guidance into the relevant skill instead of keeping it in always-loaded instructions.
6. Store local dev URLs only when they are durable setup facts for a configured project lane.
7. Preserve the file's existing structure and labels unless the local pattern is clearly stale, and keep it focused enough for always-loaded context.
8. Run the repository's supported sync and checks after source edits, then report the source file changed and the generated or installed target that was verified.
