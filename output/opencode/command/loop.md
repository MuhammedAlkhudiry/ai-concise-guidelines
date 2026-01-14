---
description: Start autonomous loop - keeps working until task is complete
---

You are starting an autonomous loop.

<loop-trigger>$ARGUMENTS</loop-trigger>

## Loop Protocol

**Before EACH iteration:**
1. Read session files if available: `README.md`, `plan.md`, `state.md`
2. Review AGENTS.md in project root for project-specific rules
3. Check todo list to see what's done vs pending

**During work:**
- Follow all rules in AGENTS.md strictly
- Use the todo list to track progress — update status as you go
- Don't repeat work already completed in previous iterations
- Verify each step before moving to the next
- If blocked, try alternative approaches

**Quality gates:**
- Run type-check/lint/tests after making changes
- Don't skip the after-task checklist
- No shortcuts — if something only works unsafely, stop and report

**Cleanup (CRITICAL):**
- Remove ALL dead code, commented blocks, debug statements
- Delete unused imports, variables, functions
- No leftover TODOs from this session
- Clean up any temporary/experimental code before declaring done

**Before declaring done:**
1. Invoke the `audit` skill — do NOT self-approve
2. Fix all blockers reported by audit
3. Re-audit if fixes were needed

**Completion:**
- Only after audit APPROVED, output: `<promise>DONE</promise>`
- If audit REJECTED, fix issues and re-audit
- Maximum iterations: 50

Begin working on the task now.
