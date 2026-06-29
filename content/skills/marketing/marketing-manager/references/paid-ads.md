# Paid Ads

Use this reference for Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads, X Ads, app campaigns, retargeting, and paid social/search diagnostics.

## Account Health Checks

Inspect durable setup first:

- Account/customer/ad account ID.
- Billing status and payment method status without exposing payment details.
- Advertiser/business verification.
- Policy/disapproval/account suspension issues.
- Campaign, ad group/ad set, ad, keyword/product/feed, asset, and audience statuses.
- Budget, bid strategy, learning/review status, limited eligibility, and schedule.
- Conversion actions, tags/pixels, app events, landing page, UTM rules, and CRM lead capture.

For Google Ads accounts with API credentials configured, run the read-only helper before using UI-only inference:

```bash
rtk bun "$HOME/.agents/skills/marketing-manager/scripts/google-ads-readonly-report.ts"
```

The helper summarizes account basics, campaign status, current 7-day versus previous 7-day delivery, ad approval/review status, and conversion-action status. Treat `configured: false` as a setup gap, not as campaign failure.

## Diagnosis Patterns

- **Active but not serving**: verification, billing, policy, review, paused parent entity, date/schedule, budget, bid too low, audience too narrow, missing assets, disapproved keywords/ads, conversion strategy constraints, or tracking/domain issues.
- **Serving but no clicks**: query/placement mismatch, weak creative, low relevance, poor offer, bad targeting, ad rank, or low intent.
- **Clicks but no leads/sales**: landing page mismatch, slow page, trust gap, form/checkout issue, tracking bug, low-quality traffic, weak CTA, or delayed conversion window.
- **Spend spike or drop**: budget/bid changes, auction changes, seasonality, policy changes, audience saturation, tracking drift, or campaign status changes.

## Optimization Output

- Current account/campaign state.
- Most likely blocker or opportunity.
- Evidence from account data.
- Change options with risk and expected effect.
- Exact approval request before spend or campaign changes.

Never change spend, bids, campaigns, ads, audiences, billing, conversion actions, or account settings without explicit approval.
