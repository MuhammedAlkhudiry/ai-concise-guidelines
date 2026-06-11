# Deep QA Suite Standard

## Coverage Standard

- Default to a regression-ready suite, not a thin smoke list.
- Include smoke cases as a small subset only when they identify the fastest confidence path.
- Cover every meaningful user-triggered branch, role or permission difference, durable side effect, and integration boundary.
- Add negative and edge cases for real failure modes, not artificial permutations.
- Include end-to-end cases that prove the full workflow works across screens/services and focused cases that isolate risky branches.
- Include non-functional checks when relevant: accessibility, performance perception, responsiveness, localization, analytics, logging, privacy, and security.
- Avoid duplicate cases that only change labels or repeat the same assertion.

## Case Design

- Each case tests one clear behavior or scenario.
- Steps must be phrased as user-visible actions or observable system events.
- Expected results must mention the visible UI, persisted data, emitted notification/event, integration call, permission outcome, or error state being verified.
- Preconditions must list exact account roles, feature flags, records, fixtures, external service states, dates/times, and device/browser requirements.
- Test data must be specific enough to run: names, emails, amounts, statuses, dates, limits, file types, locale, timezone, or record relationships.
- For destructive or stateful flows, include reset/cleanup expectations.
- For async flows, include how to observe completion without guessing.
- For failures, state both what appears and what must not change.

## Priority Guide

- `Critical`: Blocks primary workflow, risks data loss, grants unauthorized access, breaks payment/revenue, or corrupts cross-system state.
- `High`: Breaks common workflows, important role behavior, required notifications, or major regression surfaces.
- `Medium`: Covers less common branches, useful boundaries, secondary workflows, and recoverable errors.
- `Low`: Covers polish, rare edge cases, copy-only behavior, or low-impact compatibility checks.

## Type Guide

- `Happy Path`: Primary successful flow.
- `Alternate Path`: Valid non-default route through the workflow.
- `Validation`: Required fields, invalid input, constraints, and boundary values.
- `Permission`: Role, ownership, team, tenancy, authentication, and authorization behavior.
- `State Transition`: Status changes, lifecycle rules, retries, cancellation, restoration, and idempotency.
- `Integration`: API, webhook, email, push, payment, analytics, search, storage, import/export, or background job behavior.
- `Data Integrity`: Persistence, relationships, calculations, ordering, filtering, deduplication, and cleanup.
- `Error Handling`: Recoverable failure, unavailable dependency, timeout, stale state, conflict, and user feedback.
- `Security`: Access control, injection, sensitive data exposure, CSRF/session behavior, rate limiting, and audit trails.
- `Accessibility`: Keyboard, focus, labels, announcements, contrast-sensitive states, and reduced-motion behavior.
- `Performance`: Load, pagination, perceived latency, slow network, large data, and repeated action behavior.

## Case Template

```markdown
### TC-<ID>: <Title> [status]

**Priority**: Critical | High | Medium | Low
**Type**: Happy Path | Alternate Path | Validation | Permission | State Transition | Integration | Data Integrity | Error Handling | Security | Accessibility | Performance
**Suite**: Smoke | Regression | Full
**Tags**: @feature:<name>, @component:<name>, @integration:<name>

**Preconditions**:
- ...

**Steps**:
1. ...

**Expected Result**:
- ...

**Cleanup**:
- ...
```

## Rules

- Make steps observable, specific, and ordered.
- State exact expected results, including what must remain unchanged.
- Do not include implementation code.
- Reflect business impact in priority, not test complexity.
- Do not invent product behavior. If behavior is unknown, state the assumption or add a gap.
- Do not pad the suite with shallow variants. Add cases because they cover distinct risk.
- Do not reduce the answer to happy path plus a few generic errors. Cover branches, limits, permissions, persistence, and integrations.
