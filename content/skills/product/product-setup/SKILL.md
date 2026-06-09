---
name: product-setup
description: PRODUCT_SETUP.md durable product setup for approved surfaces, evidence sources, read-only access paths, check playbooks, setup gaps, product improvement, and health workflows.
---

# Product Setup

Maintain `PRODUCT_SETUP.md` as durable product setup for product improvement, product health, UX, code, and database work.

## Workflow

1. Read repo-root `PRODUCT_SETUP.md` before product analysis when it exists.
2. Create or refresh it when product setup is missing, stale, or blocking the requested work. Use `references/PRODUCT_SETUP.md` as the guide.
3. Inspect durable context sources only as needed: product docs, README, deployment docs, manifests, app config, env examples, routes, jobs, tests, monitoring docs, analytics docs, and operational notes.
4. Record approved evidence sources, adapters, safe read-only commands, safe production query paths, access gaps, recurring risks, product surfaces, code surfaces, UX surfaces, and check playbooks.
5. Update `PRODUCT_SETUP.md` only for durable changes, not one-off run output.

## Rules

- Store setup and context, not current incidents, ranked recommendations, raw output, one-off metrics, or run logs.
- Redact secrets, DSNs, API tokens, database passwords, private keys, and full connection URIs.
- Keep production access read-only and documented. Production writes, destructive queries, schema changes, long exports, and ambiguous targets are blockers.
- Preserve historical notes only when they explain a recurring risk, product constraint, or future check behavior.
- Do not create separate setup files for UX, code, database, or health audits.
