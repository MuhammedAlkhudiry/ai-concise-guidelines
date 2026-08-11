---
name: final-polish
description: Post-implementation hardening before human review.
---

## Workflow

1. Review the diff for scope creep, churn, unjustified tests, missing coverage, regressions, and crossed producer-consumer contracts. Fix or report
   contract units that are `breaking`, `unsafe`, `stale`, or `ambiguous`.
2. Run $simplify in self-contained subagents with the exact scope and no inherited turns, evaluating each pass before the next. Run $test-writing to
   audit coverage and close approved worthwhile gaps. These passes may edit.
3. Run these exact-target, read-only reviews in parallel using self-contained subagents with no inherited turns:
   - $code-review as a Standards review.
   - $refactor-opportunities.
   - $ux-ui when the diff affects an interface; inspect the rendered result or report `BLOCKED`. Report unavailable passes instead of simulating them.
4. Run $verification as the final fix loop. Fix task-related failures and report each check as `PASS`, `FAIL`, or `BLOCKED`.
5. Run a final read-only reviewer gate in a self-contained subagent with no inherited turns. The main agent owns synthesis and final reporting.

## Rules

- Include every report section and state empty, skipped, unavailable, or blocked results.
- Use `READY FOR HUMAN REVIEW` only when no blocker remains.

## Report template

```md
# <READY FOR HUMAN REVIEW | NOT READY FOR HUMAN REVIEW>

## Simplify

- **Applied:** <items or none>
- **Suggested:** <items or none>

## Refactor opportunities

- **<Recommended | Optional>: <problem>** (`<files>`)
  - **Impact:** <impact>

<or "No worthwhile refactor opportunities found">

## Code review

<$code-review output>

## UI/UX review

- **<issue>**
  - **User goal:** <goal>
  - **Current:** <behavior>
  - **Fix:** <recommended behavior>
  - **Reason:** <reason>

<or "No findings", "Skipped", or "Blocked: <reason>">

## Final reviewer gate

<use the $code-review finding format, or "Clear">

## Verification

- `<check>` — <PASS | FAIL | BLOCKED>
```
