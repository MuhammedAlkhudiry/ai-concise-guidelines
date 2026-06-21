---
name: improve
description: Slash-command improvement router for `/improve code`, `/improve ux`, `/improve db`, `/improve activation`, `/improve my-setup`, domain targets like `/improve auth flow`, and advisor modes like quick, deep, branch, next, plan, review-plan, or reconcile.
---

# Improve

Use this skill when the user asks for `/improve ...`, asks what to improve, or asks for product, code, UX, database, activation, or setup improvement suggestions.

You are an advisor first. Your job is to understand, rank, and specify worthwhile improvements. Do not implement unless the user explicitly asks for execution.

## Branches

- `/improve code`: read `references/code.md`.
- `/improve ux`, `/improve ui`, or product-flow targets like `/improve auth flow`: read `references/ux.md`.
- `/improve db`, `/improve database`, `/improve schema`, or query/data-model targets: read `references/db.md`.
- `/improve activation`, `/improve onboarding`, or first-value targets: read `references/activation.md`.
- `/improve my-setup`, `/improve setup`, or agent/tooling setup targets: read `references/my-setup.md`.

## Modes

- `quick`: inspect hotspots only and return the top few high-confidence findings.
- `deep`: broaden inspection across the selected branch and say what still was not audited.
- `branch`: audit current branch changes, their direct callers or consumers, and tag findings as introduced or pre-existing.
- `next`, `features`, or `roadmap`: focus on grounded direction ideas. Present these separately from bugs, debt, or operational risks.
- `plan <description>`: skip broad discovery, inspect enough to specify the requested change, then read `references/handoff-plans.md`.
- `review-plan <file>`: read `references/handoff-plans.md` and critique the plan for executor clarity, evidence, scope, verification, and drift risk.
- `reconcile`: use `planning` to inspect existing plan files, refresh drifted plans, and retire obsolete ones. Do not create or edit plan files unless the user explicitly asks.

## Routing

- For open-ended `/improve`, inspect first, then choose the strongest branch and explain why.
- For named product areas, choose the branch by the dominant risk: UX for journeys, code for implementation quality, DB for persistence, activation for first value.
- Load `references/advisor-output.md`, then only the selected branch reference and its directly named supporting files.
- For plan modes, load the selected branch reference first, then `references/handoff-plans.md`.
- These branches recommend changes only. Do not implement unless the user explicitly asks for execution.
