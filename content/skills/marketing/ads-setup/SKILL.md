---
name: ads-setup
description: Advertising setup and inventory maintenance through a project-root ADS.md, including accounts, campaigns, conversions, and access gaps.
---

Use `$service-access` for platform access and `$manage-ad-accounts` for reporting or mutations beyond inventory discovery.

## Workflow

1. Read the existing `ADS.md`, then identify the project's advertising goals, destinations, promoted apps, domains, conversion events, and lead paths
   from authoritative project sources.
2. Discover every accessible platform and account. Paginate through all exposed campaign states to distinguish current campaigns from inactive, ended,
   archived, deleted, or removed history.
3. Classify campaigns using ownership, destination, promoted app, tracking assets, and campaign evidence. Put unresolved relationships under
   `Needs classification`.
4. Create or refresh `ADS.md` with the contract below. Preserve still-valid manual context and record the synchronization time, sources, and coverage
   gaps.
5. Finish when every accessible account and current campaign is represented or named in `Access gaps`, historical exclusions are summarized, and every
   ambiguous relationship is named in `Needs classification`.

## ADS.md contract

Use these sections:

- **Scope:** project, advertising purpose, destinations, promoted apps, and exclusions.
- **Accounts:** platform, business or manager, account name and ID, currency, timezone, browser readiness, API readiness, and ownership confidence.
- **Conversions:** primary and secondary outcomes, platform event names, source, destination, attribution settings, deduplication, and downstream
  qualified outcome.
- **Campaigns:** platform, account ID, campaign ID, name, project relevance, status, delivery status, objective, placement, promoted app, budget type
  and amount, bidding strategy, start, end, destination, and last observed time.
- **Lead flow:** form or landing page, consent surface, CRM destination, deduplication key, response owner, and qualified-lead definition.
- **Needs classification:** accessible accounts or campaigns whose project relationship is unresolved.
- **Access gaps:** unavailable platforms, accounts, fields, statuses, pages, or API routes and the exact read-only follow-up needed.

## Data rules

- Treat platform IDs as strings and preserve their exact representation.
- Preserve platform-native status, objective, budget, bidding, currency, timezone, and attribution values.
- Keep `ADS.md` readable: store the current campaign inventory and durable definitions, not raw daily metrics, full ad hierarchies, credentials,
  tokens, lead records, or personal data.
- Treat `ADS.md` as a dated snapshot; live platforms remain authoritative.
