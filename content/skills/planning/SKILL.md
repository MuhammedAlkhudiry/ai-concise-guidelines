---
name: planning
description: "Create executable implementation plans with clear phases, assumptions, and code decisions."
---

# Plan Mode

## Rules

- Plan only. Do not implement until explicit approval.
- Write every plan to file (`plan.md` or `plan-<n>-<slug>.md`).
- Ask questions only with the question tool.
- If uncertainty can change structure or approach, ask.
- If not asked, record it under `## Assumptions`.
- No tentative language (`maybe`, `consider`, `perhaps`).
- Include concrete code snippets for key implementation points.
- Reference existing code with `[path:line]`.

## Workflow

1. Load context: `KNOWLEDGE.md`, `master-plan.md` (if present), upstream plans.
2. Inspect code: related modules, patterns, tests, integration points.
3. Research first: code, docs, similar features, web; ask only unresolved structural questions.
4. Scope check:
   - Split if any: 3+ subsystems, 6+ phases, unclear single deliverable, unresolved early dependencies.
   - If split: create `master-plan.md` + first child plan; list remaining child plans.
5. Draft plan file using template below.

## Plan Template

```markdown
# Plan: <feature>
Status: draft | Created: YYYY-MM-DD

Master plan: <path or N/A>
Upstream: <summary or N/A>
Downstream: <summary or N/A>

## Goal
One sentence outcome.

## Assumptions
- Explicit defaults not confirmed by user.

## Approach
- Chosen architecture and why.
- Code references: `[path:line]`.
- Key implementation snippets (definitive).

## Required Skills
- <skill> — reason
- tdd
- code-simplifier
- project-skill-creation (if domains changed)

## Phases
### Phase 1: <name>
- [ ] 1.1 Atomic task `[path:line]`
- [ ] 1.2 Atomic task
- [ ] 1.R Human review + approval (~5 min)

### Phase 2: <name> ⟂ Phase 3: <name> (if parallel)
- [ ] 2.1 ...
- [ ] 2.R Human review + approval (~5 min)

### Phase N-1: Simplify
- [ ] Simplify changed code
- [ ] Run relevant checks/tests
- [ ] (N-1).R Human review + approval (~5 min)

### Phase N: Finalize
- [ ] Update `KNOWLEDGE.md` if new business context appears
- [ ] N.R Human review + approval (~5 min)
```

## Quality Bar

- Tasks must be atomic, verifiable, ordered, and referenced.
- Mark parallel phases explicitly; otherwise run sequentially.

## Status Markers

- `[ ]` pending
- `[x]` done
- `[~]` blocked (reason)
- `[!]` needs decision

## Per-Turn Updates

1. Read plan file first.
2. Update task statuses.
3. Record decisions in `## Approach`.
4. Re-check `## Assumptions`.

## Plan Exit

- `READY TO BUILD` or `BLOCKED: <reason>`.
- On approval (`go`, `build`, `approved`), switch to execution using the plan file.
