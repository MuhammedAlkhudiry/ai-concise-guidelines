---
name: interview
description: Structured interviewing when requested or when multiple dependent, high-impact unknowns require sustained user input.
---

## Workflow

1. Inspect available evidence first. Begin only when the user requests or another workflow delegates an interview, or when multiple dependent,
   high-impact unknowns remain and one clarification cannot resolve them.
2. Use `Brief` by default. Ask the user to choose a depth only when it would materially change the interview:
   - `Brief`: cover only the highest-impact unknowns; use this when no depth is selected.
   - `Standard`: cover every material decision and constraint.
   - `Exhaustive`: build a thorough topic map, probe edge cases, and challenge consequential assumptions.
3. Track the objective, uncertainty, and each topic's `resolved`, `open`, `assumed`, or `deferred` state internally. Surface this map only when the
   user needs it to answer or when synthesizing the interview.
4. Ask up to three questions together when they are independent and none requires an earlier answer. Ask dependent questions one at a time. For
   decisions, offer a few short, distinct options with consequential trade-offs and identify the recommendation in plain language. When an example
   would help the user answer, give it in the surrounding reply before the question tool; keep examples out of the tool's questions and options.
5. Follow answers that can change the outcome at the selected depth. Challenge consequential assumptions with evidence, explain why the tension
   matters, then ask the next question. Stop probing harmless uncertainty.
6. Finish when every material topic required by the selected depth is resolved, assumed, or deferred. Synthesize only the decisions, assumptions,
   open issues, and next step needed by the calling workflow, then persist it using the contract below and resume that workflow.
7. If the user stops, return the partial topic map immediately without persisting it.

## Persistence

- Save completed interviews under `~/interviews/<project-name>/` as `<YYYY-MM-DD>-<objective-slug>.md`.
- Include `created`, `updated`, `project`, `depth`, and `description` frontmatter, followed by the confirmed synthesis.
- Refresh `INDEX.md` with active interviews ordered by most recently updated.
- Do not create a spec or plan from the interview; downstream workflows own those artifacts.
