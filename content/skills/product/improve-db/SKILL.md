---
name: improve-db
description: Improve a product database's schema, migrations, indexes, queries, ORM models, scopes, relationships, constraints, data integrity, performance, and persistence workflows. Use for prompts like "improve database", "review schema", "optimize queries", "audit migrations", "database performance", "model cleanup", or "data model cleanup".
---

# Improve DB

Improve the real database at the right scale: small schema cleanup, query fixes, useful model scopes, ORM model cleanup, indexes, migration hygiene, data integrity, reporting paths, or broader persistence redesign.

## Workflow

1. For open-ended requests, do not ask what to improve. Inspect first, choose the highest-impact database target, and explain the choice.
2. Use `product-setup` for durable product setup, approved database evidence sources, safe read-only production query paths, and any needed `PRODUCT_SETUP.md` updates.
3. Inspect broadly before choosing: sample multiple relevant tables, migrations, relationships, constraints, indexes, query builders, ORM models, scopes, repeated filters, jobs, reports, tests, and docs. Do not stop at the first table, first missing index, first migration smell, or first obvious query issue when deeper database evidence is available.
4. Run only documented read-only production queries when production evidence is needed. Prefer slow-query logs, monitoring, explain plans, schema dumps, and existing reports over ad hoc probing.
5. Search the web when current database engine behavior, framework guidance, indexing strategy, migration safety, or package choices matter.
6. Identify candidate improvements across correctness, data integrity, query performance, indexes, constraints, relationship modeling, ORM model clarity, useful scopes, migrations, storage growth, observability, fixtures, and test coverage.
7. Compare candidates by data-integrity impact, runtime frequency, performance risk, confidence, implementation size, and migration/deployment risk. Recommend the strongest target, not merely the first target found.
8. Suggest the change only. Include enough detail for a later execution pass.

## Result Style

- Lead with the highest-impact database improvements, not a raw schema audit.
- State what database areas were sampled and why the chosen target outranks the other candidates.
- Tie recommendations to concrete tables, migrations, queries, code paths, tests, explain plans, slow-query evidence, runtime behavior, or current external documentation.
- Explain the smallest correct execution path for each important suggestion.
- Include model cleanup, relationship fixes, and reusable scopes when they make query intent clearer or remove repeated database conditions.
- Include larger data-model redesigns, index changes, or migration sequences when they are the correct answer.
- Call out weak evidence, missing access, risky production contracts, or blocked verification directly.

## Rules

- Never edit files, install packages, import databases, run migrations, run seeders, or implement the suggestion from this skill.
- Never run write queries, destructive queries, schema changes, or maintenance commands against production.
- Use `prod-db-to-ddev` for production-to-local imports, `product-health` for live operational DB health, and framework-specific skills for implementation.
- Ask for clarification only when the target codebase is unknown or multiple unrelated targets make inspection impossible.
- Do not read, search, cite, or rely on agent memory, rollout summaries, previous-session notes, or memory-derived context unless the user explicitly asks for prior context.
- Do not create separate database-audit setup files.
