---
name: planning
description: Implementation planning and saved-plan management.
---

## Workflow

1. Inspect the affected code and resolve blocking decisions before finalizing the plan. When questions are required, ask them without outputting a plan.
2. Run $refactor-opportunities against the affected code. Add a prefactor step only when a recommended refactor should precede the main change; omit optional cleanup.
3. Write the plan in the conversation using the shape below.
4. When the user explicitly asks to persist or manage a plan, run `plan --help` and follow its current storage, frontmatter, indexing, and archiving contract.

## Plan Shape

- Keep plans short; expand only when a detailed plan is requested.
- Include only work explicitly or implicitly agreed upon. Put uncommitted ideas in `✨ Extras`; they are outside the plan until the user selects them.
- Use bullets for decisions and numbered lists for steps.
- Use only relevant sections:
  - `🎯 Product Decisions`: user story and UX decisions.
  - `🛠️ Technical Decisions`: data model and architecture decisions.
  - `🧭 Implementation Steps`: one dense line per step, including relevant technical details and symbol names.
  - `✅ QA/Verification Steps`: manual flows and relevant automated or structural checks.
  - `🔁 Migration Steps`: ordered backfill, data movement, or compatibility work.
  - `📝 Updates`: later decisions or scope changes.
  - `✨ Extras`: list of uncommitted nice-to-haves.
