---
name: opencode
description: OpenCode CLI delegation for explicit OpenCode requests, non-interactive prompts, another-repo edits, provider/model forcing, and `opencode run` workflows.
---

# OpenCode

Use local `opencode` only when the user explicitly asks for OpenCode.

Use this model form:

```bash
opencode run 'Reply with exactly: pong' --model=opencode-go/model-name
```

For another repo, add `--dir`:

```bash
opencode run 'Update the requested file only, then stop.' --model=opencode-go/model-name --dir /absolute/path/to/repo
```

After it runs, inspect the touched files and `git diff`. For read-only tasks, confirm there is no diff.

Prefer high/the highest thinking level when available.
