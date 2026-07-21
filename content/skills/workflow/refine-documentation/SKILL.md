---
name: refine-documentation
description: Markdown documentation refinement.
---

## Workflow

1. Determine the in-scope documents and permitted structural operations from the user's request. Merge, move, rename, or delete only in-scope files when it creates a clearer canonical structure.
2. Read related sources for context and find the editable source before changing generated or mirrored Markdown.
3. Pair with the format-specific skill: $manage-agent-md for agent instructions, $manage-skill for skills, or $project-knowledge for project knowledge. Use $systematic-work for exhaustive corpus coverage.
4. Map each document's purpose, claims, evidence, overlaps, contradictions, links, and canonical ownership.
5. Resolve truth before editing. Give each fact or instruction one canonical owner, link to it elsewhere, and mark unsupported claims as unresolved. Preserve constraints whose removal would change meaning or safety.
6. Before moving or deleting a document, preserve its useful content and search for dependent links, indexes, navigation, scripts, and tooling.
   Update references and required redirects, then remove the obsolete file rather than leaving a duplicate or empty shell.
7. Re-read the result, inspect the diff for lost or invented meaning, search for stale references and remaining duplicates, and run available Markdown or link checks.
   Report material structural changes, truth corrections, and unresolved gaps.
