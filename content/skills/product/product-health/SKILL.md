---
name: product-health
description: >-
  Product health reports covering bugs, Sentry cleanup, slow paths,
  infrastructure, PostHog and AI usage, observability gaps, and operations.
  Use for product health checks and investigations.
---

## Workflow

1. Establish context before querying health sources:
   - Check `PRODUCT_SETUP.md`; report missing or stale setup as a gap.
   - Read the README, deployment docs, manifests, app config, env examples, and recent git history. Treat commits as leads, not proof.
   - Detect relevant sources, adapters, access gaps, risks, and check playbooks from the code and docs.
2. Query configured sources with `references/source-adapters.md`; prefer structured CLI or API JSON over dashboards.
   Use absolute times with timezone and never expose secrets or full connection URIs.
   Treat production changes, long exports, destructive queries, and ambiguous targets as blockers.
3. Compare the current window with the previous window and usual baseline across journeys, jobs, data integrity, performance, observability, AI usage, and cost or capacity.
4. Investigate findings deeply enough to support conclusions:
   - For Sentry, verify org and project context, then read full issue details and representative events.
   - Resolve only issues confirmed as fixed, inactive, superseded, or known noise. Do not archive, merge, delete, or bulk-change issues unless requested.
   - For AI features, assess adoption, outcomes, tools and actions, confusing sessions, drop-off, repeated intents, and product improvements.
5. Report findings and analysis before raw statistics:
   - Explain cause, severity, baseline change, impact, suspicious changes, false alarms, and ignorable noise.
   - Rank by affected users or tenants, critical flows, revenue risk, or operational risk. Include observability gaps.
   - Use numbers as evidence; put pure statistics in a table at the end.
   - Link opaque issue IDs and include their titles: `[APP-123](https://issue-url) - issue description`.
   - For resolved Sentry issues, include the link, title, stale evidence, and why resolution was safe.
6. If setup maintenance was requested, use $product-setup to record durable changes, not current run results.
