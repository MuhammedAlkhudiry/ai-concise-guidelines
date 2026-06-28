---
name: marketing-manager
description: Marketing operations manager for product marketing setup, account/context inventory, content planning, social publishing drafts, lead generation, paid ads diagnostics, SEO/discovery, lifecycle/email planning, performance monitoring, and marketing reporting. Use when the user asks to set up marketing for a project, manage marketing accounts, create or review campaign/content plans, draft posts or ads, inspect ad delivery or account blockers, find or triage leads, monitor marketing performance, build recurring marketing reports, or improve acquisition/conversion across channels.
---

# Marketing Manager

Run marketing as an operating loop: setup context, choose the channel/job, gather evidence, draft or diagnose, and return the next decision.

## Fast Workflow

1. Read repo-root `PRODUCT_SETUP.md` when available. If marketing setup is missing and the task depends on it, use [references/setup.md](references/setup.md).
2. Identify the active mode:
   - **Setup**: product, offer, audience, accounts, tracking, channels, and approval rules.
   - **Content**: posts, campaign calendars, creative briefs, repurposing, landing copy, SEO pages, or email/SMS.
   - **Leads**: listening, lead search, inbound messages, lead scoring, outreach drafts, and follow-up.
   - **Paid ads**: account status, campaign structure, delivery blockers, copy, targeting, tracking, spend, and optimization.
   - **Performance**: channel report, experiment review, anomaly diagnosis, or recurring monitor.
3. Read only the relevant reference:
   - Setup and interview: [references/setup.md](references/setup.md)
   - Channel/content work: [references/channel-ops.md](references/channel-ops.md)
   - Lead work: [references/lead-ops.md](references/lead-ops.md)
   - Paid ads: [references/paid-ads.md](references/paid-ads.md)
   - Performance: [references/performance.md](references/performance.md)
   - Public actions and compliance: [references/safety.md](references/safety.md)
4. Separate durable setup from run output. Store durable project context in `PRODUCT_SETUP.md`; keep current metrics, incidents, temporary ideas, and raw outputs out of setup files.
5. Prefer drafts, recommendations, and approval checkpoints. Do not perform public or spend-affecting actions without explicit approval.

## Evidence Standard

- Use first-party account data, product setup, project docs, analytics, ad platforms, CRM/inbox data, and real assets before generic advice.
- Search the web when current platform policies, ad product capabilities, market examples, SEO guidance, or benchmark claims matter.
- State when a recommendation is based on inference rather than direct account data.
- Preserve the distinction between marketing performance, product performance, and tracking gaps.

## Approval Boundary

Default to draft-only for:

- Publishing, editing, deleting, or scheduling public content.
- Sending public replies, DMs, email/SMS, or outreach.
- Creating, launching, pausing, editing, or deleting campaigns, ad groups, ads, keywords, audiences, budgets, bids, conversion actions, tags, or account settings.
- Changing billing, verification, access, pixels, domains, catalogs, forms, automations, or CRM routing.

When approval is needed, show the exact action, account/channel, content or setting, expected effect, and rollback limits.

## Output Shape

For setup or interview work:

- `Captured`: durable facts learned.
- `Still Needed`: only questions that change execution.
- `Setup Update`: what should go into `PRODUCT_SETUP.md`.
- `Next Interview Question`: one focused question or a small grouped set.

For execution work:

- `Evidence`: what was inspected.
- `Diagnosis` or `Draft`: the useful output.
- `Risks`: policy, brand, tracking, or operational concerns.
- `Approval Needed`: exact action if any.
- `Next Step`: the strongest next move.
