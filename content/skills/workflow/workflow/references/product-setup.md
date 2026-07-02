# Product Setup

Maintain durable product setup in `PRODUCT_SETUP.md`.

## Workflow

1. Read repo-root `PRODUCT_SETUP.md` before product analysis when it exists.
2. Create or refresh it when product setup is missing, stale, or blocking the requested work. Use the setup shape below as the guide.
3. Inspect durable context only as needed: product docs, README, deployment docs, manifests, app config, env examples, routes, jobs, and tests.
   Include monitoring, analytics, and operational notes when they affect the setup.
4. Record approved evidence sources, adapters, safe read-only commands, safe production query paths, access gaps, recurring risks, important surfaces, and check playbooks.
5. Update `PRODUCT_SETUP.md` only for durable changes, not one-off run output.

## Rules

- Store setup and context, not run output.
- Store setup and context, not current incidents, ranked recommendations, raw output, one-off metrics, or run logs.
- Include product surfaces, core journeys, UX surfaces, code surfaces, database surfaces, environments, signal sources, evidence paths, adapters, access gaps, recurring risks, and check playbooks, including AI or agentic feature usage and marketing/ads setup when present.
- Update it only when durable context changes: source added/removed, access changes, setup gap discovered, recurring risk confirmed, important journey changes, or reliable check command/API changes.
- Do not write current incidents, recommendations, ranked ideas, issue lists, raw command output, full check results, timestamps from a run, one-off metrics, or run logs.
- Redact secrets, DSNs, API tokens, database passwords, private keys, and full connection URIs.
- Keep commands/API calls reproducible without tokens or private values.
- Keep production access read-only and documented. Production writes, destructive queries, schema changes, long exports, and ambiguous targets are blockers.
- Preserve historical notes only when they explain a recurring risk, product constraint, or future check behavior.
- Do not create separate setup files for UX, code, database, or health audits.

## Product Setup Guide

Repo-root `PRODUCT_SETUP.md` is durable product setup for product health, product improvement, UX, code, and database work.

Include:

- Product context: app names, environments, deployment or hosting clues, and important docs.
- Product surfaces: backend, frontend, mobile, AI or agentic features, queues, scheduler, search, analytics, infrastructure, support, billing, or other relevant areas.
- Core journeys: activation, repeated use, upgrade/payment, support/recovery, and other critical user workflows.
- UX surfaces: important screens, states, empty/error/loading paths, responsive concerns, and accessibility clues.
- Code surfaces: important routes, components, services, jobs, data models, tests, and product-facing technical risks.
- Database surfaces: important tables, migrations, relationships, constraints, indexes, query paths, data invariants, slow-query sources, safe production read-only paths, and growth risks.
- Signal sources: source name, detected evidence, adapter/tool, configured or blocked status, and notes. For AI or agentic features, include durable sources for conversations, messages, runs, steps, tool calls, usage events, write proposals, credits, cost, and safety blocks when the product has them.
- Marketing setup: durable offer, audience, accounts, ad account IDs, analytics/search console/tag manager properties, CRM/inbox sources, conversion actions, UTM/source rules, approval rules, safe read-only check paths, setup gaps, recurring risks, and marketing check playbooks when marketing matters.
- Access and setup gaps: what is missing, why it matters, and exact user setup steps.
- Known recurring risks: durable product, UX, code, operational, database, or data risks that should influence future checks.
- Check playbooks: read-only commands, APIs, dashboards, or skills to use for each source, including baseline windows, impact slices, product journeys, scheduled work, data invariants, performance checks, AI usage/outcome checks, monitoring gaps, and cost/capacity limits.
