---
name: product-health
description: "Create or update PRODUCT_SETUP.md as durable product context, then report actual product-health run results in chat. Use when the user asks for product health, latest bugs, slow APIs or queries, server status, database status, Redis status, Horizon/jobs health, Sentry health, PostHog analytics health, or an operational health report."
---

# Product Health

Maintain `PRODUCT_SETUP.md` as durable product context, then report the current health run in chat.

## Workflow

1. Read target repo context: root and nested `AGENTS.md`, `PRODUCT.md`, README, deployment docs, manifests, app config, env examples, and existing `PRODUCT_SETUP.md`.
2. Create or refresh repo-root `PRODUCT_SETUP.md` before the health run when it is missing or stale. Use `references/PRODUCT_SETUP.md` as the guide.
3. Detect health sources from code and docs, then record sources, evidence paths, adapters, access gaps, recurring risks, and the check playbook for product journeys, scheduled work, data integrity, performance, and capacity. Use the helper for the first pass:

```bash
bun content/skills/product-health/scripts/discover-health-sources.ts /path/to/repo
```

4. Query each configured source using the adapter below. Prefer structured CLI/API output over dashboards.
5. Check product journeys, jobs/cron, data integrity, performance, monitoring gaps, and cost/capacity wherever the repo provides reliable signals.
6. Report actual run results in chat using the result style below.
7. After the run, update `PRODUCT_SETUP.md` only for durable changes to what is monitored or how to check it.

## Result Style

- Lead with analysis and findings, not dashboard-style stats.
- Explain what matters: likely causes, severity, baseline change, user or business impact, suspicious changes, false alarms, and what can be ignored.
- Compare current signals with the previous window and usual baseline before calling a number good or bad.
- Rank findings by affected users, tenants, critical flows, revenue risk, or operational risk.
- Include action items only when useful for investigation, fixes, monitoring follow-up, or access blockers.
- Report blocked or missing observability as a finding instead of inferring health.
- Use numbers as evidence for findings. Do not make raw counts, percentages, p95s, rates, or trend stats the main result.
- Put pure numeric stats in a compact table at the end of the reply.

## Source Adapters

- Sentry: use `sentry-cli` for issues, events, spans, traces, aggregate Explore data, slow APIs/queries, and job exceptions. Use Sentry setup/upgrade skills for setup gaps. Do not mutate releases or issues.
- Laravel/Horizon/jobs: detect Horizon, queues, scheduler, workers, and failed jobs. Check scheduled work, queue depth, oldest queued job age, retry loops, and last successful run. Use Sentry first, then read-only Artisan over SSH or Forge when available.
- Server: use Forge CLI or SSH from project docs for uptime, disk, memory, PHP-FPM, Nginx, Supervisor, Horizon, Redis, and logs. Include safe capacity clues. Do not mutate services.
- Database: use `doctl` for DigitalOcean managed databases. Check status, version, nodes, region, storage, backups, maintenance/events, slow queries, connection-pool clues, and durable read-only integrity checks. Do not report credentials.
- Redis: detect cache/session/queue/Horizon usage. Check Sentry first, then read-only `PING`, `INFO`, memory, clients, evictions, `SLOWLOG GET`, and `LATENCY LATEST`.
- PostHog: use PostHog API plus configured PostHog skills for analytics, metric investigations, and SDK health. Stay on product analytics unless the repo or user expands scope.
- Typesense/search: detect Scout/Typesense packages and env. Check Sentry first, then read-only `/health`, `/metrics.json`, `/stats.json`, collection status, and indexing drift when credentials exist.

## Safety

- Never print secrets, DSNs, API tokens, database passwords, private keys, or full connection URIs.
- Redact sensitive values in commands and reports.
- Prefer JSON and structured APIs.
- Use absolute times with timezone for external data windows.
- Production changes, long exports, destructive queries, and ambiguous targets are blockers, not health checks.
