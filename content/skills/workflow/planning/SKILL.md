---
name: planning
description: Conversational and disk-backed planning for implementation plans, roadmaps, task breakdowns, plan updates, draft/approved plan files, plan review, and plan execution.
---

# Planning

Use this skill when the user asks to plan work, revise a plan, approve a plan, execute from a plan, or review an existing plan.

## Workflow

1. If the direction is still exploratory, architectural, product, UX, or materially uncertain, apply the workshop workflow first.
2. Research the relevant repo, callers, consumers, tests, docs, and constraints before committing to detailed execution steps.
3. Run a question scan before writing or approving a plan.
4. Use disk-backed plan files once the user is shaping an implementation plan, roadmap, task breakdown, or execution handoff.
5. Treat every plan change as a file mutation followed by a readback: update the saved plan, then show the updated plan or changed section.
6. Follow `references/plan-files.md` for draft, approved, done, and archived behavior.

## Plan Files

Load `references/plan-files.md` before creating, updating, approving, archiving, or executing a disk-backed plan. It is the source of truth for plan file shape, lifecycle, and CLI use.

## Questions

- If blocking questions exist, ask only the questions needed to make the plan reliable and do not print the plan yet.
- Treat planning-relevant unknowns as questions; do not hide them as assumptions, risks, or verification notes.

## Rules

- Do not edit code while preparing a plan unless the user explicitly asks to implement.
- Do not create plan files for casual advice or early workshop discussion before the user is shaping a concrete plan.
