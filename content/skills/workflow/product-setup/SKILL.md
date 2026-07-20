---
name: product-setup
description: Durable PRODUCT_SETUP.md creation and maintenance for product definition, journeys, code and data surfaces, evidence sources, access gaps, recurring risks, and reproducible read-only check playbooks.
---

Maintain repo-root `PRODUCT_SETUP.md` as durable operating context, not a health report.

## Workflow

1. Read existing setup before product analysis.
2. Create or refresh it only when setup maintenance is requested or required by the requested setup task, and only when a source, access path, recurring risk, critical journey, or reliable check has changed.
3. Inspect durable sources as needed: README and other product docs, manifests, app config, env examples, routes, jobs, tests, deployment docs, analytics, and monitoring.
4. Record the product definition, surfaces, critical journeys, evidence sources, safe adapters and
   commands, access gaps, recurring risks, and check playbooks. Keep history only when it explains a
   recurring risk, product constraint, or future check; do not create competing setup files for product
   definition, UX, code, database, marketing, or health.
5. Keep commands and API calls reproducible and production access read-only, without tokens, private
   values, DSNs, passwords, private keys, or full connection URIs. Production writes, destructive
   queries, schema changes, long exports, and ambiguous targets are blockers.
6. Read back the changed document and confirm it contains durable setup—not incidents, recommendations, issue lists, raw output, full check results, run timestamps, or one-off metrics.

## Content

- Product definition: purpose, audience, problems solved, value, terminology, business model, and durable scope or constraints.
- Product and environment context, including app names, environments, deployment or hosting clues, and important docs.
- Backend, frontend, mobile, queues, scheduler, search, billing, support, analytics, infrastructure, AI, and other relevant surfaces.
- Critical activation, repeated-use, payment, support, and recovery journeys.
- Important UI states, accessibility or responsive risks, routes, components, services, jobs, models, tests, and technical boundaries.
- Important tables, relationships, invariants, constraints, indexes, query paths, growth risks, and approved production read paths.
- Signal sources with adapter, configured or blocked status, and durable notes.
- Marketing accounts, identifiers, conversion sources, UTM rules, approval boundaries, and safe checks when marketing matters.
- Access gaps with impact and exact setup steps.
- Recurring risks that should shape future product checks.
- Read-only check playbooks with useful baselines, slices, journeys, invariants, performance checks, monitoring gaps, and cost limits.
