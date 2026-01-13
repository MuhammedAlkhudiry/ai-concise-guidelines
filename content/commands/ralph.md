---
description: Start autonomous Ralph Loop - keeps working until task is complete
---

You are starting a Ralph Loop session.

**Task:** $ARGUMENTS

## Loop Protocol

**Before EACH iteration:**
1. Re-read any existing plan files (`.plan.md`, `plan.md`, etc.)
2. Review AGENTS.md in project root for project-specific rules
3. Check todo list to see what's done vs pending
4. Read `changes.log` if it exists to see what was already modified

**During work:**
- Follow all rules in AGENTS.md strictly
- Use the todo list to track progress — update status as you go
- Document all file changes in `changes.log`
- Don't repeat work already completed in previous iterations
- Verify each step before moving to the next
- If blocked, document the blocker and try alternative approaches

**Quality gates:**
- Run type-check/lint/tests after making changes
- Don't skip the after-task checklist
- No shortcuts — if something only works unsafely, stop and report

**Cleanup (CRITICAL):**
- Remove ALL dead code, commented blocks, debug statements
- Delete unused imports, variables, functions
- No leftover TODOs from this session
- Clean up any temporary/experimental code before declaring done

**Completion:**
- When FULLY complete, output exactly: `<promise>DONE</promise>`
- If you stop without this marker, you will be prompted to continue
- Maximum iterations: 50

Begin working on the task now.

<user-task>$ARGUMENTS</user-task>
