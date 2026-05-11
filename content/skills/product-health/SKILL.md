---
name: product-health
description: "Create or update PRODUCT_HEALTH_SETUP.md as durable monitoring context, then report actual product-health run results in chat. Use when the user asks for product health, latest bugs, slow APIs or queries, server status, database status, Redis status, Horizon/jobs health, Sentry health, PostHog analytics health, or an operational health report."
---

# Product Health

Maintain the target repo's `PRODUCT_HEALTH_SETUP.md` as durable monitoring context, then report each run's actual results in chat.

## Workflow

1. Read the target repo context first: root and nested `AGENTS.md`, `PRODUCT.md`, README, deployment docs, `composer.json`, `package.json`, app config, env examples, and existing `PRODUCT_HEALTH_SETUP.md`.
2. Create or refresh repo-root `PRODUCT_HEALTH_SETUP.md` before the health run when it is missing or stale. Use `references/PRODUCT_HEALTH_SETUP.md` as the guide.
3. Detect health sources from code and docs, then record durable monitoring context in `PRODUCT_HEALTH_SETUP.md`: sources, evidence paths, adapters, access/setup gaps, known recurring risks, and the check playbook.
4. Query each configured source using the adapter below. Prefer structured CLI/API output over dashboards.
5. Report actual run results in chat using the result style below.
6. After the run, update `PRODUCT_HEALTH_SETUP.md` only for durable new findings about what is monitored or how to check it. Do not write current incidents, raw command output, status snapshots, one-off metrics, or run logs into setup files.

## Result Style

- Lead with analysis and findings, not dashboard-style stats.
- Explain what matters: likely causes, severity, user or business impact, suspicious changes, false alarms, and what can be ignored.
- Include action items or a short plan only when useful for investigation, fixes, monitoring follow-up, or access/setup blockers.
- Use numbers as evidence for findings. Do not make raw counts, percentages, p95s, rates, or trend stats the main result.
- Put pure numeric stats in a compact table at the end of the reply.

## Source Adapters

- Sentry: use `sentry-cli` for Sentry CLI commands covering issues, events, spans, traces, and aggregate Explore data. Cover Laravel, React, React Native, slow APIs, slow DB/query spans, and job exceptions. For setup gaps, use `sentry-php-sdk`, `sentry-react-sdk`, or `sentry-react-native-sdk`; for outdated JavaScript SDKs, use `sentry-sdk-upgrade`. Do not manage releases or mutate issues.
- Laravel/Horizon/jobs: detect `laravel/horizon`, queue drivers, scheduler, workers, and failed-job storage. Use Sentry first, then read-only Artisan over SSH or Forge CLI when production access exists.
- Server: use Forge CLI or SSH from project docs. Check uptime, disk, memory, PHP-FPM, Nginx, Supervisor/daemon, Horizon, Redis, and recent logs. Do not deploy, restart, edit env, or mutate services.
- Database: use `doctl` for DigitalOcean managed databases. Check cluster status, engine/version, nodes, region, size/storage, backups, maintenance/events, and connection-pool clues. Do not pull credentials into the report.
- Redis: detect cache/session/queue/Horizon usage. Check Sentry Redis spans/errors, then read-only Redis health over SSH/Forge when available: `PING`, `INFO`, memory, clients, evictions, blocked clients, persistence, `SLOWLOG GET`, and `LATENCY LATEST`.
- PostHog: use PostHog API plus the PostHog skills declared in `config/skills.ts` for analytics queries, metric investigations, and SDK health. Default to product analytics only; do not audit flags, experiments, surveys, or other PostHog features unless the project clearly uses them or the user asks.
- Typesense/search: detect Scout/Typesense packages and env. Check Sentry search issues first, then read-only Typesense `/health`, `/metrics.json`, `/stats.json`, collection status, and indexing drift when credentials exist.

## Safety

- Never print secrets, DSNs, API tokens, database passwords, private keys, or full connection URIs.
- Redact sensitive values in commands and reports.
- Prefer JSON output and structured APIs where available.
- Use absolute times and include the timezone for external data windows.
- Keep source adapters observational. Production changes, long-running exports, destructive queries, and ambiguous production targets are blockers to report, not health checks to perform.
