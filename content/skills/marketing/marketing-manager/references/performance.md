# Performance Monitoring

Use this reference for marketing reports, recurring monitors, anomaly checks, and optimization reviews.

## Metric Groups

- Reach: impressions, reach, search visibility, share of voice.
- Engagement: clicks, CTR, saves, shares, comments, replies, profile visits, video retention.
- Leads: forms, calls, DMs, WhatsApp chats, signups, demo requests, qualified leads.
- Revenue: purchases, subscriptions, pipeline, ROAS, CAC, payback, LTV when available.
- Paid efficiency: spend, CPC, CPM, CPA, conversion rate, search terms, placements, quality/relevance indicators.
- Lifecycle: open/click/reply/unsubscribe, activation, repeat purchase/use, reactivation.
- Tracking health: missing events, tag/pixel status, UTM coverage, attribution caveats.

## Reporting Rules

- Compare against a relevant previous window and note seasonality or incomplete current-day data.
- Separate channel performance from tracking gaps.
- Avoid treating vanity metrics as success unless they connect to a stated marketing job.
- Highlight the single strongest decision: continue, stop, fix, test, or investigate.
- Do not store current metrics in `PRODUCT_SETUP.md`.

## Recurring Monitor Rules

Notify the user only when there is meaningful change:

- Ads begin serving after a blocker.
- Spend/impressions/clicks/leads materially change.
- A new billing, verification, policy, tracking, or delivery blocker appears.
- Lead volume or lead quality changes enough to affect action.
- A public post or campaign requires response.

No-update runs should stay quiet unless the user asked for a visible report every time.
