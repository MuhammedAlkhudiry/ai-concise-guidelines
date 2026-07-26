---
name: ux-ui
description: UX/UI discovery, prototyping, implementation, options, and review.
---

## Routing

- For a new interface, redesign, or meaningful flow change, use the interview and prototype loop below.
- For a review, audit, or small scoped change, inspect the existing interface and proceed directly without forcing the discovery loop.
- When implementing or refining an interface from a raster reference, use $visual-matching before implementation.

## Interview and prototype loop

1. Inspect the existing flow, platform conventions, design system, realistic content, and relevant states. Then use $interview to resolve the user's
   goal and every material product or design decision that cannot be established from available evidence.
2. After the interview synthesis is confirmed, create one lightweight standalone HTML prototype with a switcher for the requested number of
   directions, or five by default.
3. Make each direction meaningfully different in workflow, hierarchy, density, state handling, responsiveness, or interaction. Do not count the
   current UI or cosmetic variations as distinct directions. Use the same realistic content and relevant states across options so the user can compare
   the experience rather than the data.
4. Present the prototype, recommend one direction from the confirmed goal and constraints, and wait for the user to select a direction before
   deepening it.
5. Refine the selected direction in two stages:
   - Settle the UX, including flow, hierarchy, interaction, density, responsiveness, and states.
   - After the UX is approved, refine the UI styling and polish without reopening settled UX decisions unless new evidence changes them.
6. After each material revision, summarize what changed, identify the remaining decision, and wait for feedback. Continue until the user explicitly
   approves the prototype.
7. After approval, ask whether to import and wire the UI into the product now or preserve the prototype with a saved plan for later implementation.
   Recommend the handoff that fits the task, but do not infer it; prototype approval does not authorize product implementation.
8. Treat the exploratory prototype as temporary. Remove it after direct implementation, or use $planning to persist it with the implementation plan
   when the user chooses a later handoff.

Use $workshop when abstract product framing or strategic options remain unresolved before prototyping.

## Product fit

- Derive the interface from the product's tasks, content, platform, existing system, and intended character.

## Design-system boundary

- Follow the established design system, including its components, patterns, semantic tokens, typography, iconography, density, and motion.
- Treat deviations and extensions as exceptions. Explain the unmet need and get explicit user approval before introducing a new component, token,
  pattern, or visual language.
- When an existing component cannot support the intended behavior, propose a system-level extension instead of forcing a poor interaction or adding a
  one-off substitute.

## Review protocol

Report concrete issues in descending user impact:

1. Blocked, unsafe, destructive, or unrecoverable flows
2. Missing states, broken responsiveness, or inaccessible interaction
3. Unclear hierarchy, navigation, wording, or action priority
4. Missing, delayed, misleading, or excessive feedback
5. Inconsistent visual or interaction language
6. Polish opportunities that improve trust, personality, or delight

For each issue, identify the affected user goal, current behavior, recommended behavior, and reason. Distinguish evidence, inference, and aesthetic
preference.

## Completion standard

Do not call the work complete until the primary task, relevant failure and recovery paths, accessibility behavior, realistic content, and relevant
viewport and input modes work as one coherent experience.

## User preferences

- Prefer icons paired with text labels.
