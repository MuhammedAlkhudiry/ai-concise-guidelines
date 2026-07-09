---
name: product-health
description: Product health reports covering bugs, Sentry cleanup, slow paths, infra, PostHog, AI usage, observability, and ops checks.
---

Run a product health check from durable setup.

## Workflow

1. Use `/workflow product-setup` when `PRODUCT_SETUP.md` is missing, stale, or blocking.
2. Read durable repo context: `PRODUCT.md`, README, deployment docs, manifests, app config, and env examples.
3. Review recent git history before querying health sources; treat commits as leads, not proof.
4. Detect health sources from code and docs, then record sources, adapters, access gaps, risks, and check playbooks:

```bash
bun "$HOME/.agents/skills/product-health/scripts/discover-health-sources.ts" /path/to/repo
```

5. Query configured sources with `references/source-adapters.md`. Prefer structured CLI/API output over dashboards.
6. For Sentry stale cleanup, verify org/project context and compare recent events against the checked window.
   Resolve only issues that are fixed, inactive, duplicated by a newer issue, or known noise with no current user impact.
7. Check product journeys, jobs/cron, data integrity, performance, monitoring gaps, AI usage, and cost/capacity where reliable signals exist.
8. Report actual run results using the result style below.
9. After the run, use `/workflow product-setup` to update `PRODUCT_SETUP.md` only for durable changes to what is monitored or how to check it.

## Rules

- Lead with findings and analysis, not raw dashboard stats.
- Explain likely causes, severity, baseline change, user or business impact, suspicious changes, false alarms, and what can be ignored.
- Compare current signals with the previous window and usual baseline before judging them; include commit context only when it improves diagnosis.
- Rank findings by affected users, tenants, critical flows, revenue risk, or operational risk.
- When naming opaque issue identifiers such as `AWRAQ-1VX`, render the identifier as a Markdown link when the source provides a URL.
  Include the readable title inline: `[AWRAQ-1VX](https://issue-url) - issue description`.
- Include Sentry cleanup results when issues were resolved: issue link, title, stale evidence, and why resolving it was safe.
- For AI or agentic features, explain usage patterns, successful and failed outcomes, tool/action mix, confusing sessions, and drop-off points.
  Include repeated user intents and evidence-backed product improvements.
- Include action items only when useful, and report blocked or missing observability as a finding.
- Use numbers as evidence, not as the main result. Put pure stats in a table at the end.
- Never print secrets, DSNs, API tokens, database passwords, private keys, or full connection URIs.
- Prefer JSON and structured APIs.
- Use absolute times with timezone for external data windows.
- Sentry issue resolution is allowed only after confirming the detected org/project and stale evidence.
  Do not archive, merge, delete, or bulk-change issues unless the user explicitly asks.
- Production changes, long exports, destructive queries, and ambiguous targets are blockers, not health checks.
