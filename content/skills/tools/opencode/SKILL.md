---
name: opencode
description: OpenCode CLI delegation for explicit OpenCode requests, ask-mode second opinions, non-interactive prompts, another-repo edits, provider/model forcing, and `opencode run` workflows.
---

# OpenCode

Use local `opencode` only when the user explicitly asks for OpenCode.

Use this model form:

```bash
opencode run 'Reply with exactly: pong' --model=opencode-go/model-name
```

Use `ask` mode when the user wants a second opinion, critique, explanation, or reasoning-only answer from OpenCode:

```bash
opencode run 'Ask mode. Use only the context in this prompt. Think carefully and reply with your answer. Do not read files, run commands, inspect the repository, use tools, or make changes.

Context:
<paste all relevant context here>

Question:
<ask the question here>' --model=opencode-go/model-name
```

For `ask` mode, give the model 100% of the relevant context in the prompt. Treat its answer as advisory; do not let OpenCode investigate or act.

For another repo, add `--dir`:

```bash
opencode run 'Update the requested file only, then stop.' --model=opencode-go/model-name --dir /absolute/path/to/repo
```

After it runs, inspect the touched files and `git diff`. For read-only tasks, confirm there is no diff.

Prefer high/the highest thinking level when available.

See [references/opencode-go-models.md](references/opencode-go-models.md) for known `opencode-go` models.
