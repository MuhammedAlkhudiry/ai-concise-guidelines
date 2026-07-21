---
name: ux-ui
description: Product interface design, implementation, review, and UI options.
---

## Workflow

1. Establish the user's goal and inspect the existing flow, platform conventions, and design system.
2. Apply the constraints below and verify the result against the completion standard.

## Product fit

- Derive the interface from the product's tasks, content, platform, existing system, and intended character.

## UI options

- Use the requested option count; otherwise create five. Do not count the current UI or cosmetic swaps as options.
- Make each direction meaningfully different in workflow, hierarchy, density, state handling, responsiveness, or interaction. Recommend one from the user's goal and constraints. Use $workshop for abstract option framing.
- For coded previews, use a temporary in-app switcher and keep every option connected to the same real data, actions, validation, loading states, permissions, and error states.
- After the user chooses, keep only the selected direction and remove the exploration UI and unused variants.

## Design-system boundary

- Follow the established design system, including its components, patterns, semantic tokens, typography, iconography, density, and motion.
- Treat deviations and extensions as exceptions. Explain the unmet need and get explicit user approval before introducing a new component, token, pattern, or visual language.
- When an existing component cannot support the intended behavior, propose a system-level extension instead of forcing a poor interaction or adding a one-off substitute.

## Review protocol

Report concrete issues in descending user impact:

1. Blocked, unsafe, destructive, or unrecoverable flows
2. Missing states, broken responsiveness, or inaccessible interaction
3. Unclear hierarchy, navigation, wording, or action priority
4. Missing, delayed, misleading, or excessive feedback
5. Inconsistent visual or interaction language
6. Polish opportunities that improve trust, personality, or delight

For each issue, identify the affected user goal, current behavior, recommended behavior, and reason. Distinguish evidence, inference, and aesthetic preference.

## Completion standard

Do not call the work complete until the primary task, relevant failure and recovery paths, accessibility behavior, realistic content, and relevant viewport and input modes work as one coherent experience.

## User preferences

- Prefer icons paired with text labels.