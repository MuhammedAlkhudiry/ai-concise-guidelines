---
name: product-setup
description: PRODUCT_SETUP.md creation and maintenance.
---

## Workflow

1. Read existing setup before product analysis.
2. Create it when setup maintenance is requested. Refresh it only when durable context has changed.
3. Inspect authoritative product, code, data, deployment, and observability sources.
4. Keep `PRODUCT_SETUP.md` as the sole setup document. Retain history only when it explains a recurring risk, product constraint, or future check.
5. Keep commands and API calls reproducible and production access read-only. Exclude secrets and private connection values; treat writes, destructive
   queries, schema changes, long exports, and ambiguous targets as blockers.

## Content

- Product definition: purpose, audience, value, terminology, business model, and durable constraints.
- Journeys and system surfaces: critical user flows and relevant product, code, data, and infrastructure boundaries.
- Evidence and access: authoritative sources, safe read-only commands, access status, and exact setup steps for gaps.
- Risks and checks: recurring risks and reproducible read-only checks, including useful baselines and cost limits.
