---
name: refine-documentation
description: Markdown documentation refinement and corpus rationalization across .md files for accuracy, deduplication, stale-content removal, contradiction resolution, canonical consolidation, restructuring, and concise durable editing.
---

Refine documentation into the smallest complete set of current, trustworthy guidance. Optimize for reader value, not merely fewer words.

## Scope

- For named-file work, edit only the requested files. Read related sources for context, but do not rename or delete files unless requested.
- For corpus-level work, inventory the requested set. Merge, move, rename, or delete in-scope files when that creates a clearer canonical structure.
- Find the editable source before changing generated or mirrored Markdown.
- Pair this with the format-specific skill for agent instructions, skills, project knowledge, or another governed document type. This skill owns refinement; the specialized skill owns its contract.
- Use $deep-work when the request promises exhaustive corpus coverage.

## Workflow

1. Define the document set, intended readers, reader jobs, and allowed operations.
2. Read repository rules, local style, linked files, and evidence behind factual claims.
3. Inventory each document's purpose, unique value, overlaps, references, and links.
4. Classify content as `keep`, `rewrite`, `merge`, `move`, `delete`, or `unresolved`. Mark stale, duplicated, contradictory, unsupported, temporary, and misplaced material.
5. Choose one canonical owner per fact or instruction. Link to it elsewhere; keep repetition only for distinct reader jobs.
6. Resolve truth before polishing. Match evidence to the claim:
   - runtime evidence, code, configuration, and schemas for current behavior;
   - tests and durable decisions for contracts and rationale;
   - official sources for external behavior;
   - user confirmation for business intent local evidence cannot establish.
7. Investigate conflicting evidence. Do not choose a convenient version, blend incompatible claims, or turn uncertainty into certainty.
8. Rewrite around the reader's goal. Lead with value; remove preambles, repetition, promotion, filler, empty headings, and writing commentary.
9. Preserve prerequisites, constraints, exceptions, safety information, terminology, and rationale that prevent misuse or repeated mistakes. Concision must not erase necessary nuance.
10. Prefer present-state, timeless wording. Keep dates, versions, status, and history only when they define a boundary or provide durable explanation.
11. Structure by purpose with descriptive headings. Separate procedures, reference, explanation, and history when mixing them harms usability.
12. Preserve valid frontmatter, examples, anchors, and link intent. After moves or deletions, update indexes, navigation, inbound links, and supported redirects.
13. Re-read as a user, inspect the diff for meaning lost or invented, search for remaining duplicates and stale references, and run available Markdown or link checks.

## Deletion

Before deleting a whole document during corpus-level refinement:

1. Confirm its useful content is obsolete or preserved in a canonical destination.
2. Search links, indexes, navigation, scripts, and tooling for its path or headings.
3. Update references and add a redirect when the documentation system requires one.
4. Delete the document instead of leaving an empty shell, hidden copy, or permanent tombstone without a reader need.

## Completion

- Every in-scope document has a final disposition.
- Each retained claim is supported, clearly qualified, or reported as unresolved.
- Repeated facts have one canonical owner unless repetition serves a distinct reader need.
- The remaining documentation is concise, coherent, navigable, and complete for its stated purpose.
- Links, navigation, and governed file contracts remain valid.
- Report material merges, moves, deletions, truth corrections, and unresolved gaps, not routine copyedits.
