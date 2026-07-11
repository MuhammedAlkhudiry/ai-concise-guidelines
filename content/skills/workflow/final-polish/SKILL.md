---
name: final-polish
description: Post-implementation hardening for broad approved changes before human review, especially before saying READY FOR HUMAN REVIEW.
---

Use this flow after an approved implementation plan when the change spans many files, behaviors, or review surfaces. Minor edits and small features do not need the full flow.

## Workflow

1. Self-review the diff for scope creep, accidental churn, unjustified tests, meaningful missing coverage, and obvious regressions.
2. Run `code-simplifier` as fresh-context subagent edit passes. After each pass, evaluate the result and decide whether another pass is needed.
3. Run `test-coverage-audit` and close approved worthwhile behavior gaps.
4. Run `code-review` as a Standards review in a fresh subagent.
5. Triage review findings. Fix in-scope blockers and high-confidence issues; defer optional or out-of-scope items.
6. Run `verification` as the final verification and fix loop.
7. Run one final fresh reviewer gate in a subagent.
8. Run `refactor-opportunities` as a final suggestion pass in a fresh subagent.
9. Report `READY FOR HUMAN REVIEW` only when no known blockers remain, with checks run, fixes made, deferred items, and human review focus.

## Rules

- Delegate `code-simplifier`, `refactor-opportunities`, `code-review`, and every review gate to fresh-context subagents.
- If subagents are unavailable, report the missing passes instead of simulating them.
- Only `code-simplifier` subagents may edit; review and opportunity subagents are read-only.
- The main agent owns implementation, synthesis, triage, integration, final reporting, and whether another simplifier pass is needed.
- Run independent subagent reviews, inspections, or disjoint edit scopes in parallel whenever possible.
- Present `refactor-opportunities` findings to the user after the implementation is complete. Treat them as proposed next work, not as work to silently perform.

- Finish with this shape:

```text
READY FOR HUMAN REVIEW

Implemented:
- <summary>

Subagent passes:
- code-simplifier: <passes and result>
- refactor-opportunities: <count and headline>
- code-review: <blockers fixed, findings deferred, or none>
- final reviewer gate: <clear or notes>

Verification:
- <checks and results>

Deferred:
- <known non-blockers, skipped checks, or none>

Refactor opportunities:
- <recommended or optional items, or "No worthwhile refactor opportunities found">

Human review focus:
- <areas where human judgment is useful>
```

- Omit empty sections.
