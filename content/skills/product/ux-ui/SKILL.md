---
name: ux-ui
description: UX/UI discovery, prototyping, implementation, options, and review.
---

## Routing

- For a new interface, redesign, or meaningful flow change, use the interview and prototype loop below.
- For a review, audit, or small scoped change, inspect the existing interface and proceed directly without forcing the discovery loop.

## Interview and prototype loop

1. Inspect the flow, platform conventions, design system, realistic content, and relevant states. Use $interview for material product or design
   decisions that evidence cannot resolve.
2. After the interview synthesis is confirmed, create one lightweight standalone HTML prototype with a switcher for the requested number of
   directions, or five by default.
3. Make directions meaningfully different in workflow, hierarchy, density, states, responsiveness, or interaction; cosmetic variations do not count.
   Keep content and states consistent so the experience is comparable.
4. Present the prototype, recommend one direction, and wait for the user's selection before deepening it.
5. Refine the selected direction in two stages:
   - Settle the UX, including flow, hierarchy, interaction, density, responsiveness, and states.
   - After the UX is approved, refine the UI styling and polish without reopening settled UX decisions unless new evidence changes them.
6. After each material revision, summarize the change and remaining decision, then wait for feedback until the prototype is explicitly approved.
7. After approval, ask whether to implement now or preserve the prototype with a saved plan; approval alone does not authorize implementation.
8. Remove the temporary prototype after direct implementation, or use $planning to persist it with a later implementation plan.

Use $workshop when abstract product framing or strategic options remain unresolved before prototyping.

## Design-system boundary

- Follow the established design system. Before adding a component, token, pattern, or visual language, explain the unmet need and get approval.
- When the system cannot support needed behavior, propose a system-level extension instead of a poor interaction or one-off substitute.

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

- After implementation, inspect rendered UX and UI, improve until optimal, then declare it the best achievable UI.
Do not call the work complete until the primary task, relevant failure and recovery paths, accessibility behavior, realistic content, and relevant
viewport and input modes work as one coherent experience.

## User preferences

- Begin with the user's job and complete journey. Prefer one clear primary path, immediate common actions, and progressively disclosed capability.
- Favor calm, rich, professional, distinctive minimalism: hierarchy, balanced spacing, restrained color, and subtle depth instead of visual excess.
- Keep controls contextual and interactions consistent; make motion smooth, symmetric, and purposeful. Iterate from rendered evidence and finish an
  approved direction faithfully.
- Prefer icons paired with text labels.
