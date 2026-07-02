---
name: final-polish
description: Post-implementation hardening for broad code changes before human review. Use after approved implementation plans that span many files, behaviors, or review surfaces, especially before saying READY FOR HUMAN REVIEW.
---

# Final Polish

Use this flow after an approved implementation plan when the change spans many files, behaviors, or review surfaces. Minor edits and small features do not need the full flow.

## Flow

1. Self-review the diff for scope creep, accidental churn, missing tests, and obvious regressions.
2. Run `code-simplifier` as one or more fresh-context subagent edit passes. After each pass, the main agent must evaluate the result and decide whether another pass is needed. The main agent must not run these passes itself.
3. Check behavior coverage and add or adjust focused tests where the implementation changed contracts or flows.
4. Run `code-quality-review` as a read-only structural review in a fresh subagent.
5. Triage review findings. Fix in-scope blockers and high-confidence issues; defer optional or out-of-scope items.
6. Run `verification` as the final verification and fix loop. Skip smoke tests unless explicitly requested.
7. Run one final fresh read-only reviewer gate in a subagent.
8. Run `refactor-opportunities` as a final read-only suggestion pass in a fresh subagent. Do not implement its suggestions during this flow.
9. Report `READY FOR HUMAN REVIEW` only when no known blockers remain, with checks run, fixes made, deferred items, and human review focus.

## Rules

- Subagent use is absolute for `code-simplifier`, `refactor-opportunities`, `code-quality-review`, and every other review gate. The main agent must delegate these passes to fresh-context subagents, not perform or simulate them inline.
- If subagents are unavailable, say that the final-polish flow cannot be completed as written and report the missing subagent passes. Do not replace mandatory subagent passes with main-agent review.
- Only `code-simplifier` subagents may edit. Review and opportunity subagents are read-only.
- The main agent owns implementation, synthesis, triage, integration, and final reporting, but not simplifier or review execution.
- The main agent decides whether a follow-up `code-simplifier` pass is needed after reviewing each subagent pass.
- Run independent subagent reviews, inspections, or disjoint edit scopes in parallel whenever possible.
- Keep review-only passes read-only.
- Edit automatically only inside the approved plan scope.
- Defer out-of-scope refactors, optional cleanup, and smoke tests unless the user explicitly approves them.
- Present `refactor-opportunities` findings to the user after the implementation is complete. Treat them as proposed next work, not as work to silently perform.

## Reply Template

Use this shape when finishing the flow:

```text
READY FOR HUMAN REVIEW

Implemented:
- <user-facing summary of the completed change>

Subagent passes:
- code-simplifier: <number of passes; simplifications made, or none>
- refactor-opportunities: <count and headline summary; details below>
- code-quality-review: <blockers fixed, findings deferred, or none>
- final reviewer gate: <clear, or remaining non-blocking notes>

Verification:
- <checks run and results>

Deferred:
- <known non-blockers, skipped checks, or none>

Refactor opportunities:
Recommended:
- <opportunity, affected files, impact, safest next move>

Optional:
- <opportunity, affected files, impact, safest next move>

Human review focus:
- <areas where human judgment is most useful>
```

Omit empty `Recommended` or `Optional` sections. If no worthwhile refactor opportunities were found, write `Refactor opportunities: No worthwhile refactor opportunities found`.
