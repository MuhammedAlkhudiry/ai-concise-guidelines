---
name: work-brief
description: Outcome-based work briefs and saved-plan management for code and non-code tasks.
---

## Workflow

1. Inspect the relevant code, evidence, and constraints. Resolve decisions that could materially change the direction before writing the brief; when
   user input is required, ask without emitting a brief.
2. Choose one decisions heading that matches the work and record only settled approach decisions and boundaries that constrain execution.
3. Write one-line acceptance cases for the agreed outcomes. Each case must state one complete, independently observable result.
4. When the user explicitly asks to persist or manage a brief, use the established writable plan store available in the environment. When `lanes` is
   available, run `lanes plans --help` and follow its contract. Otherwise follow an existing connected-repository plan convention. Do not invent a
   storage location; when no writable plan store exists, return the complete brief and state that it was not persisted.

## Brief Shape

Use exactly two top-level sections:

1. A task-specific decisions section using the narrowest suitable heading:
   - `🛠️ Technical Decisions` for architecture, data models, refactors, integrations, migrations, and implementation boundaries.
   - `🔎 Research Decisions` for source scope, eligibility, collection method, freshness, corroboration, and deliverable format.
   - `🧪 Investigation Decisions` for hypotheses, required evidence, exclusions, and stopping conditions.
   - `📊 Data Decisions` for datasets, transformations, matching, quality rules, and output shape.
   - `⚙️ Operational Decisions` for systems, access, safety constraints, rollout, and recovery.
   - `✍️ Content Decisions` for audience, channel, message, evidence, and format.
   - `🎨 Design Decisions` for interaction, hierarchy, states, and visual constraints.
   - `🧭 Work Decisions` only when the task genuinely spans multiple kinds of work.
2. `✅ Acceptance Cases`.

Use bullets in both sections. Do not write implementation steps, assign agents, or invent ordering. State a dependency inline only when one outcome
genuinely blocks another.

Use `As a <role>, I can <capability> so <outcome>.` when an actor and their value matter. Use a direct declarative contract for technical, research,
data, and operational outcomes. Acceptance cases define what verification must establish; do not add a separate QA section.

Include only agreed work. Omit uncommitted extras and unresolved choices. Apply later scope changes by revising the affected decisions or acceptance
cases so the brief always expresses the current contract.

## Saved Plan Status

- Use `pending` for work that has not started, `progress` for work currently underway, and `done` for completed work.
- Omit `status` only when creating a pending plan; the saved-plan contract defaults a missing status to `pending`.
- Do not invent synonyms such as `in_progress`, `active`, or `complete`.
- Archive completed plans only through the active plan store; bulk archive affects only plans whose status is `done`.
