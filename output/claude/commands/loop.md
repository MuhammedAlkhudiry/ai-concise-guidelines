---
description: Start autonomous loop - keeps working until task is complete
---

You are starting an autonomous loop.

<loop-trigger>$ARGUMENTS</loop-trigger>

## Loop Protocol

**Before EACH iteration:**
1. Read session files if available: `plan.md`
2. Review AGENTS.md in project root for project-specific rules
3. Check todo list to see what's done vs pending

**During work:**
- Follow all rules in AGENTS.md strictly
- Verify each step before moving to the next
- **DO NOT ASK QUESTIONS** — user is not at the computer
- If blocked, try alternative approaches or skip and note in plan

**Completion:**

`<promise>DONE</promise>` is **sacred**. It is an oath that the task is 100% complete.

Before outputting `<promise>DONE</promise>`, you MUST be certain:
- [ ] All plan items marked done
- [ ] Audit passed (no blockers)
- [ ] Type-check/lint/tests pass
- [ ] No loose ends, no "will do later"

If ANY doubt exists — do not output `<promise>DONE</promise>`. Continue working.

Begin working on the task now.
