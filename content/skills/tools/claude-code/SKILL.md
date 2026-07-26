---
name: claude-code
description: Claude Code CLI delegation and second opinions under a usage-constrained Pro subscription.
---

## Workflow

1. Run `claude --help` for the current interface.
2. Treat the Claude Pro allowance as scarce. Make one fresh, non-interactive call per task; avoid resumed sessions, exploratory calls, and follow-ups.
3. Run `claude -p --model claude-opus-5 --effort high "<prompt>"`. Keep the prompt focused on one outcome, include only essential context, and request
   a concise response.
