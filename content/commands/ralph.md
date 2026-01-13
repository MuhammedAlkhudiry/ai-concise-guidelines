---
description: Start autonomous Ralph Loop - keeps working until task is complete
---

You are starting a Ralph Loop session.

**Task:** $ARGUMENTS

## Session Setup

1. Create session folder: `docs/ai/sessions/<YYYY-MM-DD>-<task-slug>/`
2. Create `README.md` with task context and status
3. Store this session path — pass it to all skills and subagents you invoke

## Loop Protocol

**Before EACH iteration:**
1. Read session files: `README.md`, `plan.md`, `state.md`, `workshop.md`
2. Review AGENTS.md in project root for project-specific rules
3. Check todo list to see what's done vs pending

**During work:**
- Follow all rules in AGENTS.md strictly
- Use the todo list to track progress — update status as you go
- Update session's `state.md` with progress, blockers, decisions
- Don't repeat work already completed in previous iterations
- Verify each step before moving to the next
- If blocked, document in `state.md` and try alternative approaches

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
1. Invoke the `audit` skill with session path — do NOT self-approve
2. Fix all blockers reported by audit
3. Re-audit if fixes were needed
4. Update session's `learnings.md` with retrospective and next steps

**Completion:**
- Only after audit APPROVED, output: `<promise>DONE</promise>`
- If audit REJECTED, fix issues and re-audit
- Maximum iterations: 50

Begin working on the task now.

<user-task>$ARGUMENTS</user-task>
