---
name: improve-product
description: Audit a product and recommend ranked product, UX, code, performance, analytics, and support improvements. Use when the user asks to improve a product, polish UX, find code improvements that affect the product, run a product audit, or make the product better.
---

# Improve Product

Audit the real product and return practical improvements across product value, UX, code, performance, analytics, and support.

## Workflow

1. Read target repo context: root and nested `AGENTS.md`, `PRODUCT.md`, README, user docs, routes, UI surfaces, tests, app config, env examples, analytics setup, and existing `PRODUCT_SETUP.md`.
2. Create or refresh repo-root `PRODUCT_SETUP.md` when it is missing or stale. Store only durable context: product surfaces, core journeys, UX surfaces, code surfaces, signal sources, access gaps, recurring risks, and check playbooks.
3. Inspect the actual product before recommending changes. Trace the relevant screens, flows, code paths, tests, docs, analytics, support surfaces, and error/performance signals.
4. Apply the lenses below, then rank improvements by user impact, business impact, confidence, and effort.
5. Report findings in chat. Update `PRODUCT_SETUP.md` only for durable changes to context, sources, risks, or check behavior.

## Lenses

- Product: activation, repeated use, retention, trust, monetization, onboarding, empty states, and workflow gaps.
- UX polish: hierarchy, spacing, responsive behavior, interaction friction, confusing states, copy, accessibility, loading states, error states, and mobile ergonomics.
- Code: bugs, brittle flows, product-facing technical debt, risky data assumptions, missing tests around important journeys, duplicated logic, and code that slows future product changes.
- Performance: slow screens, heavy queries, repeated network calls, expensive background work, frontend runtime friction, and bad loading behavior.
- Analytics and observability: missing events, unclear funnels, weak activation or retention definitions, blocked evidence, and places where improvement cannot be measured.
- Support and self-serve: manual gaps, help-center gaps, recovery docs, in-app guidance, and support-deflection opportunities.

## Result Style

- Lead with the highest-leverage improvements, not a raw audit log.
- Tie each recommendation to evidence from the repo, product flow, analytics, support material, or runtime signals.
- Group recommendations as `Do now`, `Do next`, `Explore`, and `Do not do` when that helps prioritization.
- Include file paths for code-backed findings.
- Explain the smallest useful implementation or validation step for each important recommendation.
- Report missing access or weak instrumentation as findings instead of guessing.

## Rules

- Do not turn the result into a generic feature brainstorm.
- Do not read, search, cite, or rely on agent memory, rollout summaries, previous-session notes, or memory-derived context. Use current repo, runtime, docs, analytics, support material, and `PRODUCT_SETUP.md` evidence only.
- Do not create separate product-improvement, UX-audit, or code-audit setup files. Extend `PRODUCT_SETUP.md` only for durable context.
- Do not write run output, recommendations, rankings, current metrics, screenshots, or one-off notes to `PRODUCT_SETUP.md`.
- Use `product-health` for current incidents, infrastructure risk, queue health, server health, database health, Redis health, Sentry health, or operational status checks.
- Use `product-strategy` for broad future bets, positioning, market direction, or deciding what major product area to build next.
