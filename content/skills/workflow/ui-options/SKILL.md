---
name: ui-options
description: Concrete UI directions or switchable coded previews before choosing a final interface. Use when the user asks to see UI options or variants. For abstract option framing, use $workshop.
---

## Workflow

1. Use the requested option count. If none is provided, default to 5 and do not count the current UI.
2. Trace the current UI, data, actions, constraints, and design system before creating options.
3. Shape each option around a meaningfully different structure, interaction model, information density, or workflow priority.
4. For coded previews, put the options behind a simple in-app switcher, tabs, or segmented control.
5. Keep coded options wired to the same real data, actions, validation, loading states, permissions, and error states unless the user asks for static mockups.
6. After the user chooses a direction, collapse the implementation to the selected option and remove unused variants unless the user wants to keep them.
7. Consider the exploration complete only when each option is distinct enough to choose or reject on structure, workflow, density, or interaction model.

## Rules

- Do not count color swaps, spacing tweaks, border-radius changes, icon swaps, or minor copy changes as separate options unless they support a complete direction.
- Avoid fake placeholder content when real app data or existing fixtures are available.
- Prefer the repo's existing components, tokens, and interaction patterns.
- Keep the preview switcher temporary and easy to delete unless the product genuinely needs it.
- Do not hide incomplete behavior inside one option. Every option should be usable enough for a fair comparison.
- Verify the options through the normal project frontend QA path when the task involves browser-visible behavior.
