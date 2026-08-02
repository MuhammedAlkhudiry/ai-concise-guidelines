---
name: audit-ad-performance
description: Advertising performance audits and prioritized improvement plans across Apple, Google, Meta, Snapchat, and TikTok.
---

Use `$ads-setup` when `ADS.md` is missing or stale, `$service-access` for platform access, and `$manage-ad-accounts` for approved mutations.

## Audit workflow

1. Read `ADS.md`. Resolve the exact accounts, objectives, business outcomes, reporting and comparison periods, currency, timezone, and attribution
   settings.
2. Read all relevant lifecycle states and pagination pages at account, campaign, ad group or ad set, and ad or creative levels. Include delivery
   diagnostics, change history, platform recommendations, and downstream lead or activation outcomes when available.
3. Validate measurement before judging performance: event firing, optimization-event alignment, deduplication, attribution windows, destination
   health, app or web tracking, and CRM delivery. Mark unavailable evidence instead of assuming it works.
4. Separate learning periods, delayed conversions, material edits, outages, promotions, and incomplete days from stable performance. Derive current
   thresholds and change limits from official platform guidance.
5. Produce the report below. Finish when each relevant account is covered, excluded with a reason, or listed under insufficient evidence.

## Diagnostic order

Diagnose in this order:

- access, policy, billing, delivery, and tracking blockers;
- business-outcome volume, efficiency, and quality;
- objective, optimization event, and funnel alignment;
- learning stability and recent change effects;
- audience overlap, saturation, placements, geography, and device;
- creative coverage, fatigue, message-to-destination continuity, and format fit;
- budget allocation, pacing, bids, and scaling constraints;
- lead response, qualification, duplicates, and downstream conversion.

## Interpretation rules

- Treat platform scores and recommendations as diagnostic evidence, not instructions. Verify the business goal, expected effect, and trade-off before
  recommending them; never enable auto-apply.
- Compare platforms only when the conversion definition, attribution basis, period, currency, and funnel stage are compatible. Otherwise present them
  separately and explain the mismatch.
- Rank findings by expected business impact, evidence strength, urgency, effort, and reversibility. Prefer one measurable change per experiment.
- Derive campaign-type diagnostics such as promoted app, placement, market, bid strategy, negatives, search terms, custom product pages, install
  breakdowns, and reconciliation routes from current official platform guidance.

## Report contract

For each finding, provide:

- platform, account, and affected object IDs;
- observed evidence and reporting period;
- diagnosis and business consequence;
- recommended change;
- expected impact and confidence;
- risk, dependencies, and reversibility;
- success metric, guardrail, evaluation window, and rollback condition.

Group results as:

1. **Blockers:** tracking, access, policy, billing, or delivery failures.
2. **Protect spend:** likely waste or material business-outcome mismatch.
3. **Improve:** evidence-backed efficiency or volume opportunities.
4. **Test:** uncertain hypotheses requiring controlled experiments.
5. **Insufficient evidence:** missing data, low volume, or incompatible measurement.

End with a short ordered action plan. Keep observed facts, inference, and platform-generated suggestions distinct.

## Change boundary

- Do not recommend scaling when the primary conversion is unverified or downstream quality is unknown.
- An audit is read-only. Route every proposed mutation through `$manage-ad-accounts`; approval of the audit does not approve its recommendations.
