---
name: planning
description: Create, review, refine, or execute conversational plans before implementation. Use when the user asks for a plan, implementation plan, roadmap, task breakdown, sequence, scope, phases, or multi-step work. For uncertain architecture, product, UX, or pre-implementation direction, apply the workshop skill first.
---

# Planning

## Workflow

1. If the direction is still exploratory, architectural, product, UX, or materially uncertain, apply the workshop workflow first.
2. Research the relevant repo, callers, consumers, tests, docs, and constraints before committing to steps.
3. Separate decisions from execution steps.
4. Map dependencies and sequence foundations before callers, integrations, tests, and cleanup.
5. Prefer vertical slices that leave the system working over broad horizontal phases.
6. Keep tasks small enough to implement, verify, and review in one focused pass.
7. Include only risks, blockers, and questions that can change the plan.
8. Review an existing plan critically before executing it.

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
- Do not create a persistent plan file unless the user explicitly asks for one.
- Use persistent-plans for durable plan files outside chat.
- Skip this skill for simple questions, obvious single-file changes, and already well-defined task lists.
- Avoid heavyweight process, machine-readable plan ceremony, placeholder tasks, and speculative phases.
