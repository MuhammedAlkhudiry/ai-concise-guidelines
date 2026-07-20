---
name: ui-options
description: Concrete UI directions or switchable coded previews before choosing a final interface. Use when the user asks to see UI options or variants. For abstract option framing, use $workshop.
---

## Workflow

1. Use the requested option count. If none is provided, default to 5 and do not count the current UI; do not count cosmetic swaps as distinct options unless they support a complete direction.
2. Trace the current UI, data, actions, constraints, and design system before creating options. Use real app data or existing fixtures where available, and prefer existing components, tokens, and interaction patterns.
3. Shape each option around a meaningfully different structure, interaction model, information density, or workflow priority.
4. For coded previews, put the options behind a simple in-app switcher, tabs, or segmented control; keep it temporary and easy to delete unless the product needs it.
5. Keep coded options wired to the same real data, actions, validation, loading states, permissions, and error states unless the user asks for static mockups. Do not hide incomplete behavior in an option.
6. After the user chooses a direction, collapse the implementation to the selected option and remove unused variants unless the user wants to keep them.
7. Consider the exploration complete only when each option is distinct enough to choose or reject on structure, workflow, density, or interaction model. For browser-visible work, verify options through the normal project frontend QA path.
