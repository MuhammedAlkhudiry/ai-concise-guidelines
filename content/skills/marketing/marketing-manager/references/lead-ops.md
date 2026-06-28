# Lead Ops

Use this reference for social listening, inbound messages, lead search, lead scoring, outreach drafts, and follow-up loops.

## Lead Workflow

1. Define the buying-intent vocabulary and exclusion vocabulary.
2. Search or inspect approved sources: social search, mentions, comments, DMs, forms, CRM, email, WhatsApp, reviews, community posts, and search queries.
3. Save or report lead candidates with source, URL/thread, author/contact handle, text/context, date, matched query, score, reason, and suggested next step.
4. Classify:
   - `hot`: direct need, buying question, quote/pricing request, or ready-to-act signal.
   - `warm`: relevant pain or intent but not ready to buy.
   - `weak`: adjacent topic with unclear need.
   - `ignore`: seller, spam, unrelated, competitor, joke, generic discussion, or policy risk.
5. Draft replies or follow-ups. Do not send without explicit approval.
6. Track outcome: replied, no response, interested, not fit, negative, converted, or follow-up date.

## Outreach Rules

- Prefer helpful, specific replies over salesy templates.
- Mention why the reply is relevant to the user's actual context.
- Avoid mass unsolicited replies, repetitive text, or pretending to be a human owner.
- Respect platform automation rules and user consent.
- Escalate sensitive, angry, legal, medical, political, or private-data situations to the user.

## Output Shape

For lead searches, return a compact table:

| Score | Source | Candidate | Why | Draft Action |
| ----- | ------ | --------- | --- | ------------ |
