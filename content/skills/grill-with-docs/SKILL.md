---
name: grill-with-docs
description: "Run a heavy alignment session that stress-tests a plan, sharpens domain language, and captures glossary or ADR notes when the user explicitly wants decisions documented."
---

# Grill With Docs

Interrogate a plan until the decision-changing uncertainty is resolved and the language is precise.

## Workflow

1. Restate the plan in plain language.
2. Build the smallest useful context packet:
   - Goal
   - Known facts
   - Constraints
   - Loaded code or docs
   - Terms under pressure
   - Current decision
3. Walk the design tree one branch at a time. Resolve dependency decisions before downstream details.
4. Ask one consequential question at a time and wait for the user before continuing.
5. For each question, explain why it matters and provide the recommended answer.
6. If code or docs can answer the question, inspect them instead of asking.
7. Pressure-test domain relationships with concrete scenarios and edge cases.
8. Cross-check user claims against existing code and docs. Surface contradictions directly.
9. Continue until the remaining uncertainty no longer changes the plan.

## Language

- Challenge vague, overloaded, or conflicting terms immediately.
- Propose one precise canonical term when language is fuzzy.
- Name aliases to avoid when they would cause future confusion.
- Keep domain language separate from implementation details.

## Documentation

- Create files lazily only after there is a real term or decision to record.
- Use `references/context-format.md` for glossary/context notes.
- Use `references/context-map-format.md` when a repo has multiple domain contexts.
- Use `references/adr-format.md` for architecture decision records.
- Keep documentation small, opinionated, and tied to settled decisions.

## Rules

- Stay standalone. Do not depend on other skills to run the session.
- Prefer sharp alignment over broad brainstorming.
- Do not batch questions unless the user asks for a fast pass.
- Do not turn glossary notes into a spec, scratchpad, or implementation plan.
- Offer an ADR only when the decision is hard to reverse, surprising without context, and the result of a real trade-off.
- Finish with settled decisions, unresolved risks, and the recommended path.
