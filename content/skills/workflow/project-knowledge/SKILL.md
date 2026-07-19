---
name: project-knowledge
description: Project feature knowledge for behavior questions, functionality docs, product investigations, glossary terms, feature packs, and history.
---

Run `knowledge --help` for the current knowledge CLI interface. Use `knowledge list` to discover the project's existing packs and `knowledge feature` to generate a feature pack; the generated artifact owns its current file shape.

## Workflow

1. Match the user's words against listed feature names and aliases.
2. Read the matching feature pack, then inspect the listed `key_files`.
3. When bootstrapping knowledge, inspect local product/code context first, then ask only product/business questions local evidence cannot answer.
4. Treat knowledge packs as intent, language, history, and code maps; treat code, tests, migrations, and runtime evidence as current behavior.
5. If the feature pack is stale or missing important context, report the gap; update it when documentation changes were requested.
6. When creating or refreshing a pack, follow `references/document-functionality.md`.
7. Read linked learnings when they affect the user's feature question.
8. Use $bug-learning when preserving a hard-earned bug investigation.
9. Run `knowledge check` after adding or editing `key_files`.

## Rules

- Do not duplicate code behavior in prose when a key-file link is enough.
- Do not create a pack for one-off implementation details.
- Add knowledge only for business meaning, domain language, history, invariants, or recurring AI confusion.
- Prefer updating an existing pack over adding overlapping files.
