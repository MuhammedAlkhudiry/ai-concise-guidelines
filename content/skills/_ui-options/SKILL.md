---
name: _ui-options
description: Use when the user asks for multiple UI or UX options, variants, directions, explorations, or a switchable preview before choosing a final interface.
---

# UI Options

Build the requested number of genuinely different UI options and make them easy to compare in the actual interface.

## Workflow

1. Use the exact number of options the user requested. If no number is provided, the default is 5.
2. Trace the current UI, data, actions, constraints, and design system before creating options.
3. Use `impeccable` when frontend design judgment is needed.
4. Build a simple in-app switcher, tabs, segmented control, or equivalent preview control so the user can inspect each option directly.
5. Keep all options wired to the same real data, actions, validation, loading states, permissions, and error states unless the user explicitly asks for static mockups.
6. Make each option meaningfully different in structure, layout, interaction model, information density, or visual hierarchy.
7. After the user chooses a direction, collapse the implementation to the selected option and remove unused variants unless the user wants to keep them.

## Rules

- Do not count color swaps, spacing tweaks, border-radius changes, icon swaps, or minor copy changes as separate options.
- Avoid fake placeholder content when real app data or existing fixtures are available.
- Prefer the repo's existing components, tokens, and interaction patterns.
- Keep the preview switcher temporary and easy to delete unless the product genuinely needs it.
- Do not hide incomplete behavior inside one option. Every option should be usable enough for a fair comparison.
- Verify the options through the normal project frontend QA path when the task involves browser-visible behavior.
