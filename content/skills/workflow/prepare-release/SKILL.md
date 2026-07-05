---
name: prepare-release
description: Release preparation review for prompts like prepare release, ready to release, release plan, production go/no-go, rollout prep, post-release automation, or what needs to happen after deploy.
---

# Prepare Release

Prepare the release around the current diff: what must happen outside the normal deploy script, what changes for users and data, and what needs follow-up after launch.

## Workflow

1. Inspect the diff, touched flows, migrations, jobs, commands, config, events, analytics, and product surfaces.
2. Run or verify the checks that match the changed surface.
3. Assume the deploy script already handles routine chores: schema migrations, cache/config clears, and usual restarts such as queues.
4. Identify only change-specific blockers, rollback constraints, and non-routine release actions.
5. Translate the release into product effects: how users use it, how stored data changes, and what support, QA, analytics, or monitoring is needed after launch.
6. Add scheduled cleanup only when the release creates temporary scaffolding.
   Examples: automations, dashboards, feature flags, compatibility code, one-off commands, backfill helpers, manual watchlists, or special alerts.
   When cleanup applies, include the trigger, owner if known, and evidence that it is safe to remove.

## Post-Release Automation

When the user asks to set up post-release automation, create actionable watches instead of only suggesting them.
Choose the lenses that fit the release:

- User behavior: who entered the new flow, completed it, dropped out, or received the expected notification.
- Data integrity: records created, migrated, duplicated, missing, stale, or stuck in a transitional state.
- Background work: jobs, retries, queues, scheduled commands, imports, exports, syncs, or backfills.
- Product health: errors, latency, conversion, support signals, permissions, billing, or external-provider failures.
- Cleanup when applicable: temporary flags, dashboards, alerts, compatibility paths, watchlists, or one-off commands that need a removal check.

Each automation should include the cadence, stop condition, signal to report, and what action to take when it fires.

## Response

- Lead with the verdict: ready to release, not ready, or ready with named caveats.
- Group only sections with real content: blockers, release actions, product effects, checks, automation, rollback, cleanup.
- Use concrete examples when relevant: seeders, backfills, derived-store refreshes, forced logouts, non-usual service restarts, provider dashboards, notification templates, or daily watches for affected users.
- Mention only change-specific risks, checks, release actions, product effects, and cleanup when applicable.
- Do not pad the answer with generic deployment checklists.
