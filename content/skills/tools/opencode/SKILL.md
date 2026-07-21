---
name: opencode
description: OpenCode CLI delegation and second opinions.
---

## Workflow

1. Run `opencode run --help` for the current interface. Use
   [references/opencode-go-models.md](references/opencode-go-models.md) for curated model choices,
   then confirm the selected model in OpenCode's live catalog.
2. Prefer high or the highest available reasoning level.
3. For a second opinion, critique, explanation, or reasoning-only answer, send an `ask`-mode prompt
   with the relevant context and exact question, explicitly forbidding edits.
