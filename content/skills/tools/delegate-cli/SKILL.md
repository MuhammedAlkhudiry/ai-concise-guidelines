---
name: delegate-cli
description: Delegating tasks or second opinions to the Claude Code, Codex, or OpenCode CLI.
---

Run the target CLI's live help before invoking it. Give each delegated call one outcome, only the essential context, and a request for a concise
response.

## Claude Code

- Treat the Claude Pro allowance as scarce: make one fresh, non-interactive call per task, and avoid resumed sessions, exploratory calls, and
  follow-ups.
- Use the strongest available Opus model with high effort.

## Codex

- Treat the Codex allowance as scarce: make one fresh non-interactive `codex exec` call per task, and avoid resumed sessions, exploratory calls, and
  follow-ups.
- Keep the model and reasoning-effort defaults from `~/.codex/config.toml`; do not override them.
- For a second opinion, critique, or explanation, run with the read-only sandbox and forbid edits.

## OpenCode

- Read the refreshed verbose model catalog, then use `opencode-go/glm-5.3-flash`. If it is unavailable, use the strongest GLM Flash model from the
  OpenCode Go provider.
- Use the `high` reasoning level, not the model's highest available level.
- For a second opinion, critique, or explanation, send an `ask`-mode prompt with the relevant context and exact question, and forbid edits.
