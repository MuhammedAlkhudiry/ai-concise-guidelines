---
name: product-health
description: Product health reports using durable product setup, covering latest bugs, stale Sentry issue cleanup, slow APIs or queries, server/database/Redis/Horizon health, Sentry, PostHog, AI assistant usage, and operational health prompts.
---

# Product Health

Report the current product health run in chat using durable product setup.

## Workflow

1. Use `product-setup` to read, create, or refresh repo-root `PRODUCT_SETUP.md` before the health run when product setup is missing, stale, or blocking the check.
2. Read target repo context: `PRODUCT.md`, README, deployment docs, manifests, app config, and env examples.
3. Detect health sources from code and docs, then record sources, evidence paths, adapters, access gaps, recurring risks, and the check playbook for product journeys, scheduled work, data integrity, performance, and capacity. Use the helper for the first pass:

```bash
bun "$HOME/.agents/skills/product-health/scripts/discover-health-sources.ts" /path/to/repo
```

4. Query each configured source using `references/source-adapters.md`. Prefer structured CLI/API output over dashboards.
5. For Sentry, triage unresolved issues for stale groups: verify the org/project context, compare recent events against the checked window, and resolve only issues that are clearly fixed, inactive, duplicated by a newer active issue, or known noise with no current user impact.
6. Check product journeys, jobs/cron, data integrity, performance, monitoring gaps, AI or agentic feature usage, and cost/capacity wherever the repo provides reliable signals.
7. Report actual run results in chat using the result style below.
8. After the run, use `product-setup` to update `PRODUCT_SETUP.md` only for durable changes to what is monitored or how to check it.

## Result Style

- Lead with analysis and findings, not dashboard-style stats.
- Explain what matters: likely causes, severity, baseline change, user or business impact, suspicious changes, false alarms, and what can be ignored.
- Compare current signals with the previous window and usual baseline before calling a number good or bad.
- Rank findings by affected users, tenants, critical flows, revenue risk, or operational risk.
- When naming issues with opaque identifiers such as `AWRAQ-1VX`, render the identifier as a Markdown link when the source provides a URL and include the readable title inline: `[AWRAQ-1VX](https://issue-url) - issue description`.
- Include Sentry cleanup results when issues were resolved: issue link, title, stale evidence, and why resolving it was safe.
- For AI or agentic features, explain actual usage patterns, successful and failed outcomes, tool/action mix, confusing sessions, drop-off points, repeated user intents, and evidence-backed product improvements.
- Include action items only when useful for investigation, fixes, monitoring follow-up, or access blockers.
- Report blocked or missing observability as a finding instead of inferring health.
- Use numbers as evidence for findings. Do not make raw counts, percentages, p95s, rates, or trend stats the main result.
- Put pure numeric stats in a clear table at the end of the reply.

## Safety

- Never print secrets, DSNs, API tokens, database passwords, private keys, or full connection URIs.
- Redact sensitive values in commands and reports.
- Prefer JSON and structured APIs.
- Use absolute times with timezone for external data windows.
- Sentry issue resolution is allowed only after confirming the detected org/project and stale evidence. Do not archive, merge, delete, or bulk-change issues unless the user explicitly asks.
- Production changes, long exports, destructive queries, and ambiguous targets are blockers, not health checks.
