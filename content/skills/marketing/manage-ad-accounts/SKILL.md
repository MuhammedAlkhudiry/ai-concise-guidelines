---
name: manage-ad-accounts
description: Advertising inventory, reporting, audits, and approved changes across Apple, Google, Meta, Snapchat, and TikTok.
---

Use `$service-access` for account access and provider sources. Derive fields, thresholds, and policies at execution time.

## Inventory

1. Read `ADS.md` and project sources for goals, destinations, apps, conversions, and lead paths.
2. Discover every accessible account and campaign state through all pages. Classify relationships from ownership, destination, app, and tracking.
3. Refresh `ADS.md`. Preserve valid context and record synchronization time, sources, and gaps.
4. Finish when every account and current campaign is represented or in `Access gaps`, with ambiguities under `Needs classification`.

`ADS.md` contains:

- **Scope:** purpose, destinations, promoted apps, and exclusions.
- **Accounts:** platform, manager, name, ID, currency, timezone, access, and ownership.
- **Conversions:** outcomes, events, source, destination, attribution, deduplication, and qualification.
- **Campaigns:** platform, IDs, name, relevance, status, objective, placement, app, budget, bids, dates, destination, and observation time.
- **Lead flow:** source, consent, CRM, deduplication, response owner, and qualified-lead definition.
- **Needs classification:** unresolved project relationships.
- **Access gaps:** unavailable routes or data and the needed follow-up.

## Reporting and audits

1. Resolve accounts, objectives, outcomes, periods, currency, timezone, attribution, and conversion definitions.
2. Read every relevant state and page across the account hierarchy, including delivery, changes, recommendations, and downstream outcomes.
3. Validate events, optimization, deduplication, attribution, destination, tracking, and CRM delivery. Separate learning, delayed conversions, edits,
   outages, promotions, and incomplete days from stable results.
4. Return evidence with object IDs, period, attribution, currency, timezone, and gaps.

For audits, diagnose access, policy, billing, delivery, and tracking first. Then assess outcomes, funnel alignment, learning, audience, creative,
budget, bids, and lead quality. Group findings as `Blockers`, `Protect spend`, `Improve`, `Test`, and `Insufficient evidence`, then add an action
plan.

Each finding needs IDs, evidence and period, diagnosis, consequence, recommendation, impact, confidence, risk, success metric, evaluation window, and
rollback condition.

## Mutations

1. Resolve the platform, account, object, current value, and requested value.
2. Read current state and present the approval contract for the exact targets and values.
3. After approval, execute only those values. Read back each target and report its ID, value, status, and timing.

## Rules

- Preserve IDs as strings and platform-native values.
- Treat platform scores and recommendations as evidence. Verify the goal, effect, and trade-off; never enable auto-apply.
- Compare platforms only with compatible conversion, attribution, period, currency, and funnel stage. Otherwise separate them.
- Separate facts, inference, and platform suggestions. Rank by impact, evidence, urgency, effort, and reversibility. Change one variable per test.
- Do not recommend scaling when the primary conversion is unverified or downstream quality is unknown.
- Keep `ADS.md` to current inventory and durable definitions. Exclude daily metrics, full hierarchies, secrets, and personal data. Live platforms
  remain authoritative.

## Approval boundary

- Reporting, auditing, and recommendations are read-only and do not authorize changes.
- Every mutation requires user approval of its platform, account, object, values, spend or delivery effect, and timing.
- Approval covers only stated targets and values. Request it again when scope or consequences change.
- Creates, edits, pauses, activations, deletions, uploads, audience or tracking changes, lead exports, access grants, and automated rules are
  mutations.
