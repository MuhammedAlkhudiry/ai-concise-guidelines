---
name: product-health
description: "Create or refresh repo-root PRODUCT_HEALTH.md by detecting a project's health sources and reporting current bugs, performance, server, database, Redis, queue, search, and product analytics status. Use when the user asks for product health, latest bugs, slow APIs or queries, server status, database status, Redis status, Horizon/jobs health, Sentry health, PostHog analytics health, or an operational health report."
---

# Product Health

Create or refresh repo-root `PRODUCT_HEALTH.md` for the target project. Keep the run read-only unless the user explicitly asks for a fix.

## Workflow

1. Read the target repo context first: root and nested `AGENTS.md`, `PRODUCT.md`, README, deployment docs, `composer.json`, `package.json`, app config, env examples, and existing `PRODUCT_HEALTH.md`.
2. Detect health sources from code and docs, then record evidence paths in `PRODUCT_HEALTH.md`.
3. If a detected source is not configured or access is missing, write a setup gap with exact user steps and continue with the remaining sources.
4. Query each configured source using the adapter below. Prefer direct read-only CLI/API calls over dashboards when structured output is available.
5. Update `PRODUCT_HEALTH.md` using `references/PRODUCT_HEALTH.md` as the structure. Preserve useful historical notes, but refresh current status, findings, timestamps, commands, and setup gaps.
6. End with a short summary of critical findings, degraded sources, blocked checks, and what should be investigated next.

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
- Ask before production mutation, long-running exports, destructive queries, or ambiguous production target selection.
