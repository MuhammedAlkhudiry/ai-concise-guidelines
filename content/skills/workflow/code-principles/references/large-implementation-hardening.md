# Large Implementation Hardening

Use this flow after an approved implementation plan when the change spans many files, behaviors, or review surfaces. Minor edits and small features do not need the full flow.

## Flow

1. Self-review the diff for scope creep, accidental churn, missing tests, and obvious regressions.
2. Run `code-simplifier` as an edit pass. Use fresh-context subagents for large or different surfaces.
3. Check behavior coverage and add or adjust focused tests where the implementation changed contracts or flows.
4. Run `refactor-opportunities` as a read-only suggestion pass in a fresh subagent.
5. Run `code-quality-review` as a read-only structural review in a fresh subagent.
6. Triage review findings. Fix in-scope blockers and high-confidence issues; defer optional or out-of-scope items.
7. Run `check-and-fix` as the final verification and fix loop. Skip smoke tests unless explicitly requested.
8. Run one final fresh read-only reviewer gate in a subagent.
9. Report `READY FOR HUMAN REVIEW` only when no known blockers remain, with checks run, fixes made, deferred items, and human review focus.

## Rules

- Use subagents for every read-only review gate. Fresh context is mandatory.
- Run independent subagent reviews, inspections, or disjoint edit scopes in parallel whenever possible.
- Keep review-only passes read-only. The main agent owns synthesis, triage, integration, and final reporting.
- Edit automatically only inside the approved plan scope.
- Defer out-of-scope refactors, optional cleanup, and smoke tests unless the user explicitly approves them.
