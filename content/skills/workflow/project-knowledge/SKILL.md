---
name: project-knowledge
description: Use when answering questions about a project feature, documenting existing functionality, investigating product behavior, or maintaining docs/knowledge feature packs, glossary terms, aliases, key files, and feature history.
---

# Project Knowledge

Use project knowledge packs as the first stop for feature/domain context.

## Folder Structure

```text
docs/knowledge/
  INDEX.md
  glossary.md
  features/<feature>.md
  learnings/<date-slug>.md
  decisions/<date-slug>.md
```

## Workflow

1. If `docs/knowledge/` exists, run `knowledge list` before broad code exploration.
2. Match the user's words against listed feature names and aliases.
3. Read the matching feature pack, then inspect the listed `key_files`.
4. When bootstrapping new project knowledge, inspect local product/code context first, then ask only product/business questions that local evidence cannot answer.
5. Treat knowledge packs as intent, language, history, and code maps.
6. Treat code, tests, migrations, and runtime evidence as the source of truth for current behavior.
7. If the feature pack is stale or missing important context, update it after verifying the code path.
8. When creating or refreshing a pack, follow `references/document-functionality.md`.
9. Use `references/feature-pack.md` for the file shape and keep the pack short.
10. Read linked learnings when they affect the user's feature question.
11. Use `bug-learning` when preserving a hard-earned bug investigation.
12. Run `knowledge check` after adding or editing `key_files`.

## Rules

- Do not duplicate code behavior in prose when a key-file link is enough.
- Do not create a pack for one-off implementation details.
- Add knowledge only when it explains business meaning, domain language, history, invariants, or recurring AI confusion.
- Prefer updating an existing pack over adding overlapping files.
