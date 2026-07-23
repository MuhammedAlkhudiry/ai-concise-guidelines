---
name: product-health
description: Product health checks, investigations, and reports.
---

## Workflow

1. Establish the scope and comparison window from `PRODUCT_SETUP.md`, recent git history, project documentation, and available health sources.
2. Apply the evaluation and source-routing rules below, then query only the sources relevant to the product and requested scope.
3. Deliver the ranked health report after every relevant finding is supported, dismissed as noise, or recorded as an evidence gap.

## Evaluation

- Report missing or stale `PRODUCT_SETUP.md` context as an observability gap.
- Compare the current window with both the previous window and usual baseline. Treat recent commits as investigation leads, not proof.
- Assess only relevant product journeys, jobs, data integrity, performance, observability, AI usage, and cost or capacity.
- Prefer structured CLI or API output over dashboards. Apart from the permitted Sentry cleanup below, stop on production mutations, destructive
  queries, long exports, or ambiguous targets.
- Investigate each material signal until its cause, impact, baseline change, and confidence are supportable or the missing evidence is explicit.

## Source routing

- **Sentry:** Use $sentry-cli and its current help. Verify the organization and project, then inspect full issue details and representative events.
- **PostHog:** Use $posthog-cli for source access, $investigate-metric for material metric changes, and $diagnosing-sdk-health for SDK health.
- **Queues, schedulers, and servers:** Discover deployed surfaces from code and configuration. Use documented read-only application commands,
  $laravel-forge-cli, or SSH as applicable. Measure live backlog, age, retries, failures, execution, services, and capacity.
- **Databases and managed services:** Use $service-access, the provider's current CLI or API help, and live schema or telemetry. Keep queries
  read-only and never report credentials.
- **Redis:** Determine whether it serves cache, sessions, queues, or another role from project configuration before querying relevant read-only
  telemetry.
- **AI features:** Locate the product's conversation, run, step, usage, tool-call, credit, proposal, and safety evidence. Assess adoption, repeat use,
  outcomes, latency, unresolved sessions, action follow-through, cost pressure, safety blocks, and user friction.
- **Search:** Discover the active provider and integration before querying its current read-only health, metrics, and index state.

## Sentry cleanup

- Resolve an issue during the report only after evidence confirms it is fixed, inactive, superseded, or known noise.
- Do not bulk-resolve or change active or ambiguous issues.
- Record every resolved issue with a green status emoji, linked identifier, title, stale evidence, and why resolution was safe.

## Report contract

- Lead with findings and analysis; place pure statistics in a table at the end.
- Prefix every statistics table row with exactly one interpretation marker: 🟢 for healthy or improved, 🟡 for warning, uncertain, or worth watching,
  and 🔴 for failed, severely regressed, or requiring action.
- Rank findings by affected users or tenants, critical-flow impact, revenue risk, and operational risk. Use colored status emojis and include
  observability gaps.
- For each finding, state cause, severity, baseline change, impact, confidence, suspicious evidence, and any false alarm or ignorable noise.
- Link opaque identifiers with their titles: `[APP-123](https://issue-url) - issue description`.
