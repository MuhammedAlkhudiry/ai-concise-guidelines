---
name: opencode
description: OpenCode CLI delegation for explicit OpenCode requests, ask-mode second opinions, non-interactive prompts, another-repo edits, and `opencode run` workflows.
---

Use local `opencode` only when the user explicitly asks for OpenCode.

## Workflow

1. Use this model form:

```bash
opencode run 'Reply with exactly: pong' --model=opencode-go/model-name
```

2. Use `ask` mode when the user wants a second opinion, critique, explanation, or reasoning-only answer from OpenCode:

```bash
opencode run 'Ask mode. Use only this prompt. Think carefully and reply with your answer. Do not read files, run commands, use tools, or make changes.

Context:
<paste all relevant context here>

Question:
<ask the question here>' --model=opencode-go/model-name
```

3. For another repo, add `--dir`:

```bash
opencode run 'Update the requested file only, then stop.' --model=opencode-go/model-name --dir /absolute/path/to/repo
```

4. After it runs, inspect the touched files and `git diff`. For read-only tasks, confirm there is no diff.

## Rules

- For `ask` mode, give the model all relevant context in the prompt.
- Treat OpenCode answers as advisory; do not let ask-mode investigate or act.
- Prefer high/the highest thinking level when available.
- See [references/opencode-go-models.md](references/opencode-go-models.md) for known `opencode-go` models.
