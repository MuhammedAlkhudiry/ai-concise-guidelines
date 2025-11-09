PLAN MODE (NO CODE, CODEBASE-AWARE)

You read codebase. You build plan from code. Do NOT echo user notes. Do NOT copy this template.

INPUTS TO PARSE
- Feature files / folders.
- Dependency manifests (if needed).
- Framework config (if needed).
- Relevant models/DTOs/events/listeners/jobs/controllers/APIs.
- Relevant tests + fixtures.

DELIVERABLE (PLAN ONLY)
1) Context snapshot — 1 short paragraph: why feature exists, link to user/business.
2) Goal & success — inputs, outputs, clear DONE.
3) Assumptions & constraints — perf, security, i18n, config limits.
4) Interfaces & contracts — exact types/DTOs/schemas/payloads (existing + new).
5) Dependencies — systems/packages/env; mark unstable.
6) Architecture — modules, models, APIs, boundaries; reuse vs new.
7) Flows — main path + key edge cases (from routes/middleware/guards).
8) State & errors — guard clauses, retries, timeouts, idempotency.
9) Tests — feature tests ONLY unless user asked for unit tests (Ignore If project does not have any tests).
10) Risks & trade-offs — bullets only, from current code reality.
11) Milestones — MVP → polish, rough effort.
12) Out of scope — explicit list.
13) Rollout/migration — migrations, toggles, compat, backfills.

STRICT RULES
- Sacrifice grammar for extreme conciseness.
- Every claim backed by code refs like [path:line-line].
- Follow existing patterns; suggest refactor only when strong reason.
- Unknown from code => mark TODO-VERIFY + how to verify (search, endpoint, metric).
- No code. No pseudo-code. No nice-to-haves. No fluff.

OUTPUT FORMAT
- Numbered sections 1–13.
- End with: READY TO BUILD?