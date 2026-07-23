---
name: project-knowledge
description: Project feature knowledge, functionality documentation, glossary terms, and history.
---

Run `knowledge --help` for the knowledge CLI.

## Workflow

1. Run `knowledge list` and match the user's words against feature names and aliases.
2. Read the matching feature pack, its linked learnings, and then its `key_files`.
3. Treat packs as intent, language, history, and code maps; treat code, tests, migrations, and runtime evidence as current behavior.
4. Report stale or missing knowledge. Update it when documentation changes were requested, preferring an existing pack over overlapping files.
5. Create a missing pack with `knowledge feature "<Feature Name>"`.
6. Run `knowledge check` after adding or editing `key_files`.

## Creating or Refreshing

1. Inspect local evidence before asking informed product or business questions. Ask only what the project cannot answer reliably.
2. Capture product meaning, domain language, core workflows, invariants, and durable history. Link implementation through `key_files` instead of
   rewriting it.
3. Add durable cross-feature terms to `docs/knowledge/glossary.md`.
4. Keep only high-signal `key_files`, useful aliases, and relevant learning links.
5. Keep history only when it explains current behavior or a durable constraint; exclude routine changes, temporary bugs, incidents, and implementation
   chores.
6. Support every claim with code, tests, runtime evidence, or durable documentation before setting `last_verified` to the current date.
