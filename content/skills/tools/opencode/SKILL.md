---
name: opencode
description: OpenCode CLI delegation and second opinions.
---

## Workflow

1. Read the live `opencode run` help and refreshed verbose model catalog before selecting the interface and model.
2. Use `kimi-for-coding/k3-256k` by default when the refreshed catalog includes it. If unavailable, use the strongest Kimi Code provider model with at
   least a 256K context window.
3. Use the `high` reasoning level. Do not use the model's highest available reasoning level.
4. For a second opinion, critique, explanation, or reasoning-only answer, send an `ask`-mode prompt with the relevant context and exact question,
   explicitly forbidding edits.
