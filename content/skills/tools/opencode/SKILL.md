---
name: opencode
description: OpenCode CLI delegation and second opinions.
---

## Workflow

1. Read the live `opencode run` help and refreshed verbose model catalog before selecting the interface and model.
2. Use `opencode-go/glm-5.3-flash` by default when the refreshed catalog includes it. If unavailable, use the strongest GLM Flash model from the
   OpenCode Go provider.
3. Use the `high` reasoning level. Do not use the model's highest available reasoning level.
4. For a second opinion, critique, explanation, or reasoning-only answer, send an `ask`-mode prompt with the relevant context and exact question,
   explicitly forbidding edits.
