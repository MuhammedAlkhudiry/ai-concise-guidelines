---
name: product-health
description: Product health reports using durable product setup, covering latest bugs, stale Sentry issue cleanup, slow APIs or queries, server/database/Redis/Horizon health, Sentry, PostHog, AI assistant usage, and operational health prompts.
---

# Product Health

Run a product health check from durable setup and report findings in chat.

## Workflow

1. Use `product-setup` when `PRODUCT_SETUP.md` is missing, stale, or blocking the check.
2. Read durable repo context: `PRODUCT.md`, README, deployment docs, manifests, app config, and env examples.
3. Review recent git history before querying health sources; treat commits as leads, not proof.
4. Detect health sources from code and docs, then record sources, adapters, access gaps, risks, and check playbooks. Use the helper:

```bash
bun "$HOME/.agents/skills/product-health/scripts/discover-health-sources.ts" /path/to/repo
```

5. Query configured sources using `references/source-adapters.md`. Prefer structured CLI/API output over dashboards.
6. For Sentry, triage unresolved issues for stale groups: verify the org/project context, compare recent events against the checked window, and resolve only issues that are clearly fixed, inactive, duplicated by a newer active issue, or known noise with no current user impact.
7. Check product journeys, jobs/cron, data integrity, performance, monitoring gaps, AI usage, and cost/capacity where reliable signals exist.
8. Report actual run results in chat using the result style below.
9. After the run, use `product-setup` to update `PRODUCT_SETUP.md` only for durable changes to what is monitored or how to check it.

## Result Style

- Lead with analysis and findings, not dashboard-style stats.
- Explain likely causes, severity, baseline change, user or business impact, suspicious changes, false alarms, and what can be ignored.
- Compare current signals with the previous window and usual baseline before judging them; include commit context only when it improves diagnosis.
- Rank findings by affected users, tenants, critical flows, revenue risk, or operational risk.
- When naming issues with opaque identifiers such as `AWRAQ-1VX`, render the identifier as a Markdown link when the source provides a URL and include the readable title inline: `[AWRAQ-1VX](https://issue-url) - issue description`.
- Include Sentry cleanup results when issues were resolved: issue link, title, stale evidence, and why resolving it was safe.
- For AI or agentic features, explain actual usage patterns, successful and failed outcomes, tool/action mix, confusing sessions, drop-off points, repeated user intents, and evidence-backed product improvements.
- Include action items only when useful, and report blocked or missing observability as a finding.
- Use numbers as evidence, not as the main result. Put pure stats in a table at the end.

- Never print secrets, DSNs, API tokens, database passwords, private keys, or full connection URIs; redact sensitive values.
- Prefer JSON and structured APIs.
- Use absolute times with timezone for external data windows.
- Sentry issue resolution is allowed only after confirming the detected org/project and stale evidence. Do not archive, merge, delete, or bulk-change issues unless the user explicitly asks.
- Production changes, long exports, destructive queries, and ambiguous targets are blockers, not health checks.
