---
name: opencode
description: OpenCode CLI delegation for explicit OpenCode requests, ask-mode second opinions, non-interactive prompts, another-repo edits, and `opencode run` workflows.
---

## Workflow

1. Run `opencode run --help` for current syntax. Read
   [references/opencode-go-models.md](references/opencode-go-models.md) for the curated OpenCode Go
   model choices, then confirm the selected model is still present through OpenCode's live
   model-listing command.
2. Use the invocation and model options documented by that help. For a second opinion, critique,
   explanation, or reasoning-only answer, send an `ask`-mode prompt that includes all relevant
   context and explicitly forbids file reads, commands, tools, or changes.

3. For another repository, use the directory option documented by `opencode run --help`.

4. After it runs, inspect the touched files and `git diff`. For read-only tasks, confirm there is no diff.

## Rules

- For `ask` mode, give the model all relevant context and the exact question in the prompt.
- Treat OpenCode answers as advisory; do not let ask-mode investigate or act.
- Prefer high/the highest thinking level when available.
