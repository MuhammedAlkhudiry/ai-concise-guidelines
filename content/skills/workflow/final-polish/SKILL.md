---
name: final-polish
description: Post-implementation hardening before human review.
---

## Workflow

1. Self-review the diff for scope creep, accidental churn, unjustified tests, meaningful missing coverage, and obvious regressions. The main agent owns implementation, synthesis, triage, integration, and final reporting.
2. When the diff crosses a producer-consumer contract, inventory both sides and compare shape, naming, requiredness, nullability, values, defaults, authorization, errors, versioning, and transforms.
   Classify each unit as `aligned`, `breaking`, `unsafe`, `stale`, or `ambiguous`; fix or report every non-aligned unit.
3. Run $code-simplifier in self-contained subagents with no inherited turns. Pass the exact scope, diff target, and constraints. Evaluate each pass before starting another; only these subagents may edit.
4. Run $test-writing to audit coverage and close approved worthwhile behavior gaps.
5. Run $code-review as a Standards review in a self-contained subagent with no inherited turns. Give every review or opportunity pass its exact target and requirements, running independent passes in parallel where possible; if
   subagents are unavailable, report missing passes rather than simulating them.
6. Triage and report every review finding without fixing it. Treat findings as proposed next work; any blocker prevents the readiness gate.
7. Run $verification as the final verification and fix loop.
8. Run one final self-contained reviewer gate in a subagent with no inherited conversation turns and report its findings without fixing them.
9. Run $refactor-opportunities as a final self-contained suggestion pass with no inherited conversation turns.
10. Report `READY FOR HUMAN REVIEW` only when no known blockers remain. Present $code-review,
    final reviewer-gate, and $refactor-opportunities findings as proposed follow-up, not silent
    implementation. Give every pass its own section and state empty results explicitly:

```md
# READY FOR HUMAN REVIEW

## Code simplifier

- <passes and result>

## Refactor opportunities

- <count, headline, and proposed items, or none>

## Code review

- <count, headline, and proposed findings, or none>

## Final reviewer gate

- <count, headline, and proposed findings, or clear>

## Verification

- <checks and results>
```
