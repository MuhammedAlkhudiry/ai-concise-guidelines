---
name: planning
description: Conversational planning for implementation plans, roadmaps, task breakdowns, sequencing, scope, phases, multi-step work, plan review, plan refinement, or plan execution.
---

# Planning

## Workflow

1. If the direction is still exploratory, architectural, product, UX, or materially uncertain, apply the workshop workflow first.
2. Research the relevant repo, callers, consumers, tests, docs, and constraints before committing to steps.
3. Run a question scan before writing the plan.
4. Separate decisions from execution steps.
5. Map dependencies and sequence foundations before callers, integrations, tests, and cleanup.
6. Prefer vertical slices that leave the system working over broad horizontal phases.
7. Keep tasks small enough to implement, verify, and review in one focused pass.
8. Include only risks, blockers, and questions that can change the plan.
9. Review an existing plan critically before executing it.

## Questions

- If blocking questions exist, ask only the questions needed to make the plan reliable and do not print the plan yet.
- Use questions to clarify missing facts, explore options, and find the best way to do the work.
- Prefer one clear question, but ask a few when they belong together; many questions are allowed when the task is genuinely underspecified.
- Do not apologize for asking planning questions; good questions are part of planning.
- Treat planning-relevant unknowns as questions; do not hide them as assumptions, risks, or verification notes.
- Expect question scans to matter most for features, larger work, and uncertain direction; for bugs and minor changes, ask only when answers can change the fix.

## Output

When the user is walking through a plan or grouping action items, use the `Plan` section with exactly these subsections:

```md
**Plan**
Implementation Steps:
[Committed implementation actions.]

Verification Steps:
[Required checks and post-work review.]

QA Steps:
[Manual QA paths and repeatable test data.]
```

## Rules

- Do not edit files while preparing a plan unless the user explicitly asks to implement.
- Do not create a persistent plan file unless the user explicitly asks; use persistent-plans for durable plan files outside chat.
- Skip this skill for simple questions, obvious single-file changes, and already well-defined task lists.
- Avoid heavyweight process, machine-readable plan ceremony, placeholder tasks, and speculative phases.
