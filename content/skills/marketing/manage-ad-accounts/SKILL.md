---
name: manage-ad-accounts
description: Advertising account reporting and approved mutations across Apple, Google, Meta, X, Snapchat, and TikTok, including lead generation.
---

Use `$service-access` for platform routes, `$ads-setup` for project inventory, and `$audit-ad-performance` for performance audits.

## Workflow

1. Resolve the exact platform, business or manager, ad account ID, object, objective, conversion event, and reporting window.
2. Follow `$service-access` to select and verify the configured API or signed-in browser route.
3. Read current state before analysis or change. Keep platform-reported metrics, attribution windows, currencies, and time zones explicit.
4. For reporting, return the requested evidence with its object IDs, period, attribution basis, currency, timezone, and coverage gaps.
5. For a mutation, use the approval contract below. Execute only the approved values, read back every target, and report the resulting IDs, values,
   status, and effective timing.

## Approval boundary

- Reporting, auditing, and recommendations are read-only and do not authorize changes.
- Every mutation requires user approval, whether performed through an API or browser. Include the platform, account, object, current value, proposed
  value, spend or delivery effect, and effective timing.
- Approval applies only to the stated targets and values. Request approval again if any target, value, scope, budget, or consequence changes.
- Treat creates, edits, pauses, activations, deletions, uploads, audience changes, tracking changes, lead exports, access grants, and automated rules
  as mutations.

## Lead generation

- Verify the form or landing-page path, consent language, event mapping, deduplication, CRM delivery, response time, and qualified-lead outcome.
- Use aggregated reporting by default. Access or export individual lead data only when the user explicitly requests it and the destination is clear.
