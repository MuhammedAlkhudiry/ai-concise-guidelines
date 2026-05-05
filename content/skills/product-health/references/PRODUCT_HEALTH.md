# Product Health Report Template

Repo-root `PRODUCT_HEALTH.md` is the current operational health report for a product.

## Rules

- Keep the report current, factual, and source-backed.
- Include only read-only checks unless the user explicitly asked for a fix.
- Separate verified facts, setup gaps, and inferred risks.
- Redact secrets and connection strings.
- Use absolute timestamps with timezone.
- Record the data window for each external query.
- Keep commands/API calls high level enough to reproduce, but do not include tokens or private values.
- Preserve useful historical notes only when they explain a current risk.

## Structure

````md
# Product Health

Last checked: YYYY-MM-DD HH:mm TZ
Checked by: AI agent
Target environment: production | staging | local | unknown
Data windows: 24h, 7d, 30d, or explicit ranges

## Summary

- Overall status: healthy | watch | degraded | blocked
- Critical findings:
- Main risks:
- Blocked checks:

## Detected Health Sources

| Source | Detected | Evidence | Adapter | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Sentry | yes/no | `path` | sentry-cli; Sentry SDK skills for setup gaps | configured/missing/blocked | |
| Laravel/Horizon/jobs | yes/no | `path` | Artisan via SSH/Forge | configured/missing/blocked | |
| Server | yes/no | `path` | SSH/Forge CLI | configured/missing/blocked | |
| Database | yes/no | `path` | doctl | configured/missing/blocked | |
| Redis | yes/no | `path` | Sentry + Redis CLI via SSH/Forge | configured/missing/blocked | |
| PostHog analytics | yes/no | `path` | PostHog API + skills | configured/missing/blocked | |
| Typesense/search | yes/no | `path` | Typesense HTTP API | configured/missing/blocked | |

## Critical Findings

| Priority | Area | Finding | Evidence | Suggested next action |
| --- | --- | --- | --- | --- |

## Sentry Issues

Data window:

| Project | Issue | Impact | First/last seen | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |

## Performance

Data window:

| Area | Slow route/query/span | p50 | p95 | Count | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |

## Laravel Queues And Jobs

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Horizon status | | | |
| Failed jobs | | | |
| Queue wait | | | |
| Long-running jobs | | | |
| Scheduler health | | | |

## Server

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Uptime/load | | | |
| Disk | | | |
| Memory | | | |
| PHP-FPM | | | |
| Nginx | | | |
| Supervisor/daemons | | | |
| Recent app/server logs | | | |

## Database

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Cluster status | | | |
| Engine/version | | | |
| Nodes/region/size | | | |
| Storage | | | |
| Backups | | | |
| Events/maintenance | | | |
| Connection pressure | | | |

## Redis

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Ping/connectivity | | | |
| Memory | | | |
| Clients | | | |
| Evictions | | | |
| Blocked clients | | | |
| Persistence | | | |
| Slowlog | | | |
| Latency | | | |

## PostHog Analytics

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| SDK health | | | |
| Key product metrics | | | |
| Recent metric anomalies | | | |
| Traffic/events ingestion | | | |

## Typesense/Search

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Health endpoint | | | |
| Metrics/stats | | | |
| Collections | | | |
| Indexing drift | | | |
| Search errors | | | |

## Setup Gaps

| Area | Missing configuration/access | Why it matters | User setup steps |
| --- | --- | --- | --- |

## Commands And API Calls Used

```text
# Redacted read-only commands/API calls only.
```

## Next Health Check Focus

- TBD
````
