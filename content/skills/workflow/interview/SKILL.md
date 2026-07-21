---
name: interview
description: Structured interviewing when requested or when multiple dependent, high-impact unknowns require sustained user input.
---

## Workflow

1. Inspect available evidence first. Begin only when the user requests or another workflow delegates an interview, or when multiple dependent, high-impact unknowns remain and one clarification cannot resolve them.
2. Ask the user to choose the interview depth before any other question:
   - `Brief`: cover only the highest-impact unknowns.
   - `Standard`: cover every material decision and constraint.
   - `Exhaustive`: build a thorough topic map, probe edge cases, and challenge consequential assumptions.
3. State the objective and uncertainty, then track each topic as `resolved`, `open`, `assumed`, or `deferred`.
4. Ask up to three questions together when they are independent and none requires an earlier
   answer. Ask dependent questions one at a time. For decisions, offer a few distinct options with
   consequential trade-offs and signal them as 🟢 recommended, 🟡 viable with meaningful trade-offs,
   or 🔴 discouraged.
5. Follow answers that can change the outcome at the selected depth. Challenge consequential assumptions with evidence, explain why the tension matters, then ask the next question. Stop probing harmless uncertainty.
6. Finish when every material topic required by the selected depth is resolved, assumed, or deferred. Synthesize the interview then persist it using the contract below, and resume the calling workflow. 
7. If the user stops, return the partial topic map immediately without persisting it.

## Persistence

- Save completed interviews under `~/interviews/<project-name>/` as
  `<YYYY-MM-DD>-<objective-slug>.md`.
- Include `created`, `updated`, `project`, `depth`, and `description` frontmatter, followed by the
  confirmed synthesis.
- Refresh `INDEX.md` with active interviews ordered by most recently updated.
- Do not create a spec or plan from the interview; downstream workflows own those artifacts.
