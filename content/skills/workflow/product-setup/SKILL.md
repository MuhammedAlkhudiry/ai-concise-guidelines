---
name: product-setup
description: Durable PRODUCT_SETUP.md creation and maintenance for product context, journeys, code and data surfaces, evidence sources, access gaps, recurring risks, and reproducible read-only check playbooks.
---

Maintain repo-root `PRODUCT_SETUP.md` as durable operating context, not a health report.

## Workflow

1. Read existing setup before product analysis.
2. Create or refresh it only when setup maintenance is requested or required by the requested setup task.
3. Inspect durable sources as needed: product docs, manifests, app config, env examples, routes, jobs, tests, deployment docs, analytics, and monitoring.
4. Record product surfaces, critical journeys, evidence sources, safe adapters and commands, access gaps, recurring risks, and check playbooks.
5. Keep commands and API calls reproducible without tokens or private values.
6. Read back the changed document and confirm it contains durable setup rather than current run output.

## Content

- Product and environment context.
- Backend, frontend, mobile, queues, scheduler, search, billing, support, analytics, infrastructure, AI, and other relevant surfaces.
- Critical activation, repeated-use, payment, support, and recovery journeys.
- Important UI states, accessibility or responsive risks, routes, components, services, jobs, models, tests, and technical boundaries.
- Important tables, relationships, invariants, constraints, indexes, query paths, growth risks, and approved production read paths.
- Signal sources with adapter, configured or blocked status, and durable notes.
- Marketing accounts, identifiers, conversion sources, UTM rules, approval boundaries, and safe checks when marketing matters.
- Access gaps with impact and exact setup steps.
- Recurring risks that should shape future product checks.
- Read-only check playbooks with useful baselines, slices, journeys, invariants, performance checks, monitoring gaps, and cost limits.

## Rules

- Store setup and context, not incidents, recommendations, issue lists, raw output, full check results, run timestamps, or one-off metrics.
- Update only when a source, access path, recurring risk, critical journey, or reliable check changes.
- Redact secrets, DSNs, tokens, passwords, private keys, and full connection URIs.
- Keep production access read-only. Production writes, destructive queries, schema changes, long exports, and ambiguous targets are blockers.
- Keep history only when it explains a recurring risk, product constraint, or future check.
- Do not split UX, code, database, marketing, or health setup into competing setup files.
