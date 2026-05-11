# Product Health Setup Guide

Repo-root `PRODUCT_HEALTH_SETUP.md` is durable monitoring context for product-health runs. Create it the first time this skill is used in a project, and update it when new durable findings change what should be monitored or how checks should run.

## Rules

- Store setup and context, not run output.
- Include the product surfaces, environments, health sources, evidence paths, adapters, access gaps, and check playbook.
- Update it when monitoring context changes: new source detected, source removed, access changes, setup gap discovered, recurring risk confirmed, or the reliable check command/API changes.
- Do not write current incidents, issue lists, raw command output, full check results, timestamps from a run, one-off metrics, or run logs.
- Redact secrets, DSNs, API tokens, database passwords, private keys, and full connection URIs.
- Keep commands/API calls high level enough to reproduce, without tokens or private values.
- Preserve historical notes only when they explain a recurring risk or future check behavior.

## Setup Shape

- Product context: app names, environments, deployment or hosting clues, and important docs.
- Monitored surfaces: backend, frontend, mobile, queues, scheduler, search, analytics, infrastructure, or other relevant areas.
- Health sources: source name, detected evidence, adapter/tool, configured or blocked status, and notes.
- Access and setup gaps: what is missing, why it matters, and exact user setup steps.
- Known recurring risks: durable risks that should influence future checks.
- Check playbook: read-only commands, APIs, dashboards, or skills to use for each source.
