# Marketing Setup

Use this reference when a project lacks durable marketing context or when starting marketing for a new product.

## Interview Order

Ask in layers. Capture answers as durable setup when they will help future runs.

1. Product and offer
   - What is sold, to whom, at what price or package shape?
   - What pain or desired outcome makes the buyer act now?
   - What proof exists: screenshots, testimonials, demos, portfolio, metrics, case studies?
2. Audience and buying context
   - Buyer, user, influencer, and gatekeeper.
   - Geography, language, culture, device, urgency, budget, and trust barriers.
   - Common alternatives and current workaround.
3. Funnel and conversions
   - Primary conversion: purchase, lead form, DM, call, WhatsApp, signup, booking, app install, trial, demo, or quote request.
   - Secondary conversions and qualification signals.
   - Follow-up process and owner.
4. Channels and accounts
   - Website, landing pages, social accounts, ad accounts, analytics, search console, tag manager, CRM, email/SMS, WhatsApp, catalogs, marketplaces, app stores, local listings, and community channels.
   - Access level, known blockers, verification/billing/policy status, and safe read-only check paths.
5. Tracking
   - Analytics property, pixels/tags, conversion actions, events, UTMs, lead source rules, CRM fields, and attribution caveats.
6. Operating rules
   - Approval boundaries, brand voice, claims to avoid, privacy constraints, languages, response style, and spend limits.

## PRODUCT_SETUP.md Marketing Section

Add one section to repo-root `PRODUCT_SETUP.md` when marketing matters:

```md
## Marketing Setup

### Marketing Shape
- Primary offer:
- Primary audience:
- Primary conversion:
- Secondary conversions:
- Main channels:
- Languages/localization:

### Marketing Accounts
| Surface | Account / Property | Access Path | Setup Depth | Notes |
| ------- | ------------------ | ----------- | ----------- | ----- |

### Tracking And Attribution
- Analytics:
- Tags/pixels:
- Conversion actions:
- UTM/source rules:
- Attribution caveats:

### Marketing Approval Rules
- Draft-only actions:
- Allowed read-only checks:
- Public/spend-affecting actions requiring explicit approval:

### Marketing Setup Gaps
| Gap | Why It Matters | Setup Step |
| --- | -------------- | ---------- |

### Marketing Check Playbooks
- Account status:
- Content performance:
- Lead/inbox review:
- Paid ads delivery:
- SEO/discovery:
- Conversion tracking:
```

Store account IDs, property IDs, public handles, safe dashboard paths, and check playbooks. Do not store secrets, payment details, private customer data, current metrics, one-off recommendations, or raw exports.
