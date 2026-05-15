---
name: ui-options
description: Use when the user asks for multiple UI or UX options, variants, directions, explorations, or a switchable preview before choosing a final interface.
---

# UI Options

Use `opencode run` with `--model=opencode/kimi-k2.6` to generate the UI opinion, then implement that direction in a comparable interface.

## Workflow

1. Use the requested option count. If none is provided, default to 5 and do not count the current UI.
2. Trace the current UI, data, actions, constraints, and design system before creating options.
3. Run `opencode run` with the traced context using `--model=opencode/kimi-k2.6`.
4. Ask Kimi to describe each option in exact implementation detail.
5. If the output is vague, ask Kimi again with the missing context instead of filling in the UI direction yourself.
6. For coded previews, put the model-backed options behind a simple in-app switcher, tabs, or segmented control.
7. Keep all coded options wired to the same real data, actions, validation, loading states, permissions, and error states unless the user explicitly asks for static mockups.
8. After the user chooses a direction, collapse the implementation to the selected option and remove unused variants unless the user wants to keep them.

## Rules

- Do not design UI yourself; Kimi owns option structure, layout, interaction model, information density, and visual hierarchy.
- Do not count color swaps, spacing tweaks, border-radius changes, icon swaps, or minor copy changes as separate options unless Kimi explicitly frames them as a complete direction.
- Avoid fake placeholder content when real app data or existing fixtures are available.
- Prefer the repo's existing components, tokens, and interaction patterns.
- Keep the preview switcher temporary and easy to delete unless the product genuinely needs it.
- Do not hide incomplete behavior inside one option. Every option should be usable enough for a fair comparison.
- Verify the options through the normal project frontend QA path when the task involves browser-visible behavior.
