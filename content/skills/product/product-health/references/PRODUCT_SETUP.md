# Product Setup Guide

Repo-root `PRODUCT_SETUP.md` is durable product context for product-health, improve-ux, and improve-code runs.

## Rules

- Store setup and context, not run output.
- Include product surfaces, core journeys, UX surfaces, code surfaces, environments, signal sources, evidence paths, adapters, access gaps, recurring risks, and check playbooks, including AI or agentic feature usage when present.
- Update it only when durable context changes: source added/removed, access changes, setup gap discovered, recurring risk confirmed, important journey changes, or reliable check command/API changes.
- Do not write current incidents, recommendations, ranked ideas, issue lists, raw command output, full check results, timestamps from a run, one-off metrics, or run logs.
- Redact secrets, DSNs, API tokens, database passwords, private keys, and full connection URIs.
- Keep commands/API calls reproducible without tokens or private values.
- Preserve historical notes only when they explain a recurring risk, product constraint, or future check behavior.

## Setup Shape

- Product context: app names, environments, deployment or hosting clues, and important docs.
- Product surfaces: backend, frontend, mobile, AI or agentic features, queues, scheduler, search, analytics, infrastructure, support, billing, or other relevant areas.
- Core journeys: activation, repeated use, upgrade/payment, support/recovery, and other critical user workflows.
- UX surfaces: important screens, states, empty/error/loading paths, responsive concerns, and accessibility clues.
- Code surfaces: important routes, components, services, jobs, data models, tests, and product-facing technical risks.
- Signal sources: source name, detected evidence, adapter/tool, configured or blocked status, and notes. For AI or agentic features, include durable sources for conversations, messages, runs, steps, tool calls, usage events, write proposals, credits, cost, and safety blocks when the product has them.
- Access and setup gaps: what is missing, why it matters, and exact user setup steps.
- Known recurring risks: durable product, UX, code, operational, or data risks that should influence future checks.
- Check playbooks: read-only commands, APIs, dashboards, or skills to use for each source, including baseline windows, impact slices, product journeys, scheduled work, data invariants, performance checks, AI usage/outcome checks, monitoring gaps, and cost/capacity limits.
