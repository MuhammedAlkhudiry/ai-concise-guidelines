# Product Health Source Adapters

- Sentry: use `sentry-cli` for issues, events, spans, traces, aggregate Explore data, slow APIs/queries, and job exceptions. Use Sentry setup/upgrade skills for setup gaps. Do not mutate releases or issues.
- Laravel/Horizon/jobs: detect Horizon, queues, scheduler, workers, and failed jobs. Check scheduled work, queue depth, oldest queued job age, retry loops, and last successful run. Use Sentry first, then read-only Artisan over SSH or Forge when available.
- Server: use Forge CLI or SSH from project docs for uptime, disk, memory, PHP-FPM, Nginx, Supervisor, Horizon, Redis, and logs. Include safe capacity clues. Do not mutate services.
- Database: use `doctl` for DigitalOcean managed databases. Check status, version, nodes, region, storage, backups, maintenance/events, slow queries, connection-pool clues, and durable read-only integrity checks. Do not report credentials.
- Redis: detect cache/session/queue/Horizon usage. Check Sentry first, then read-only `PING`, `INFO`, memory, clients, evictions, `SLOWLOG GET`, and `LATENCY LATEST`.
- PostHog: use PostHog API plus configured PostHog skills for analytics, metric investigations, and SDK health. Stay on product analytics unless the repo or user expands scope.
- AI/agentic features: detect assistant, chat, agent, conversation, run, step, usage, tool-call, credit, and proposal models/events. Audit adoption, repeat use, run success/failure, latency, tool/action distribution, unresolved sessions, write/proposal follow-through, safety blocks, credit/cost pressure, and friction from real user transcripts or structured events.
- Typesense/search: detect Scout/Typesense packages and env. Check Sentry first, then read-only `/health`, `/metrics.json`, `/stats.json`, collection status, and indexing drift when credentials exist.
