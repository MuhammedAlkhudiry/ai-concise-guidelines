# Document Functionality Method

Use this method when creating or refreshing a feature pack for an existing project.

## Goal

Create a short, accurate feature pack that helps a future agent understand the feature before reading code. Capture product meaning, domain language, workflows, invariants, history, and the key files to inspect. Do not rewrite the implementation in prose.

## Method

1. Start from the user's feature name and run `knowledge list`.
2. If a matching pack exists, read it first. If not, create one with `knowledge feature "<Feature Name>"`.
3. Search for the feature name, aliases, route names, UI labels, jobs, events, model names, table names, config keys, and test names.
4. Identify the primary entry points: routes, controllers, commands, jobs, event listeners, screens, components, services, actions, policies, and tests.
5. Trace the core workflow from user action or system trigger to final persisted state or external side effect.
6. Confirm the data model before writing: tables, models, relations, status fields, enum values, timestamps, external IDs, and ownership boundaries.
7. Identify invariants and business rules: required states, forbidden transitions, permission boundaries, retries, idempotency, cleanup, billing/accounting effects, and external contracts.
8. Read tests and seed/demo data to learn expected behavior, edge cases, and names the product already uses.
9. When you find a durable project-specific word, abbreviation, status, role, or workflow name, add or update it in `docs/knowledge/glossary.md`.
10. Read git history for the key files and related feature terms to understand how the feature evolved.
11. Capture only major history: original introduction, large redesigns, data-model changes, behavior reversals, external contract changes, migrations, and decisions that still explain current behavior.
12. Ignore minor fixes, formatting, routine refactors, dependency bumps, test-only cleanup, and temporary debugging changes unless they reveal a durable product constraint.
13. Write the pack in the template sections. Prefer bullets over paragraphs when the feature has many states or rules.
14. Add only high-signal `key_files`: files a future agent should read first, not every touched file.
15. Make the feature discoverable in `docs/knowledge/INDEX.md` through the feature link and useful aliases in the pack frontmatter.
16. Set `last_verified` to the current date after verifying code paths.
17. Run `knowledge check`.

## Quality Bar

- The `Meaning` section explains what the feature is in product/business terms, not which classes implement it.
- `Current Behavior` names the main workflow, important states, and user/system outcomes.
- `Glossary` defines terms whose meaning is project-specific or easy to confuse.
- `docs/knowledge/glossary.md` contains durable terms that are useful across more than one feature pack.
- `Code Map` explains why each key file matters.
- `History` includes only decisions that still explain current behavior.
- `Update When` names concrete changes that should force a doc update.

## Anti-Patterns

- Do not invent business intent from class names alone.
- Do not paste large code summaries, route dumps, schema dumps, or test lists.
- Do not document temporary bugs, one-off incidents, or implementation chores as feature knowledge.
- Do not mark a pack verified until code, tests, or durable docs support the claims.
- Do not make `key_files` exhaustive; make it useful.
