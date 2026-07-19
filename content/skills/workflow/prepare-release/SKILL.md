---
name: prepare-release
description: Release preparation review for release plans, production go/no-go, rollout prep, post-release automation, and deploy follow-up.
---

Prepare the release around the current diff: what must happen outside the normal deploy script, what changes for users and data, and what needs follow-up after launch.

## Workflow

1. Inspect the diff, touched flows, migrations, jobs, commands, config, events, analytics, and product surfaces.
2. Run or verify the checks that match the changed surface.
3. Inspect the project's deploy/release source and treat only the actions it actually performs as covered. Use its own help or documentation when available.
4. Identify only change-specific blockers, rollback constraints, and non-routine release actions.
5. Translate the release into product effects: how users use it, how stored data changes, and what support, QA, analytics, or monitoring is needed after launch.
6. Add scheduled cleanup only when the release creates temporary scaffolding.
   Examples: automations, dashboards, feature flags, compatibility code, one-off commands, backfill helpers, manual watchlists, or special alerts.
   When cleanup applies, include the trigger, owner if known, and evidence that it is safe to remove.

## Rules

- Lead with the verdict: ready to release, not ready, or ready with named caveats.
- Group only sections with real content: blockers, release actions, product effects, checks, automation, rollback, cleanup.
- Use concrete examples when relevant: seeders, backfills, derived-store refreshes, forced logouts, restarts, provider dashboards, notification templates, or watches.
- When the user asks for post-release automation, create actionable watches instead of only suggesting them.
- Choose automation lenses from user behavior, data integrity, background work, product health, and cleanup.
- Each automation includes cadence, stop condition, signal to report, and action when it fires.
