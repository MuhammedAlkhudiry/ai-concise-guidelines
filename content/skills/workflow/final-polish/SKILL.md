---
name: final-polish
description: Post-implementation hardening before human review.
---

## Workflow

1. Self-review the diff for scope creep, accidental churn, unjustified tests, meaningful missing coverage, and obvious regressions. The main agent
   owns implementation, synthesis, triage, integration, and final reporting.
2. When the diff crosses a producer-consumer contract, inventory both sides and compare shape, naming, requiredness, nullability, values, defaults,
   authorization, errors, versioning, and transforms. Classify each unit as `aligned`, `breaking`, `unsafe`, `stale`, or `ambiguous`; fix or report
   every non-aligned unit.
3. Run $simplify in self-contained subagents with no inherited turns. Pass the exact scope, diff target, and constraints. Evaluate each pass before
   starting another; only these subagents may edit.
4. Run $test-writing to audit coverage and close approved worthwhile behavior gaps.
5. Run $code-review as a Standards review in a self-contained subagent with no inherited turns. Give every review or opportunity pass its exact target
   and requirements, running independent passes in parallel where possible; if subagents are unavailable, report missing passes rather than simulating
   them.
6. When the diff affects a user interface or interaction, run $ux-ui as a review in a self-contained subagent with no inherited turns. Follow the
   UI/UX review contract below.
7. Report every code-review, UI/UX review, and reviewer-gate finding without fixing it. Treat findings as proposed work; any blocker prevents
   readiness.
8. Run $verification as the final fix loop. Fix task-related failures and report only `PASS`, `FAIL`, or `BLOCKED`—not review findings.
9. Run one final self-contained reviewer gate in a subagent with no inherited conversation turns and report its findings without fixing them.
10. Report `READY FOR HUMAN REVIEW` only when no known blockers remain, using the reporting contract below.

## UI/UX review contract

Inspect the relevant interface and established design system. Report concrete inconsistencies in components, patterns, semantic tokens, typography,
iconography, density, motion, hierarchy, interaction, responsiveness, accessibility, and state handling. If the interface cannot be inspected, report
the review as blocked rather than inferring visual correctness from code alone.

## Reporting

Present $simplify suggestions, $code-review, UI/UX review, and final reviewer-gate findings as proposed follow-up, not silent implementation. Give
every applicable pass its own section and state empty or skipped results explicitly:

```md
# READY FOR HUMAN REVIEW

## Simplify

- <passes, applied simplifications, and suggested simplifications or none>

## Code review

- <count, headline, and proposed findings, or none>

## UI/UX review

- <count, headline, and proposed findings; none; or skipped because the diff does not affect an interface>

## Final reviewer gate

- <count, headline, and proposed findings, or clear>

## Verification

- <checks and results>
```
