---
name: opencode
description: Use when the user explicitly wants OpenCode CLI to handle a task, especially for non-interactive prompts, editing files in another repo, or forcing a specific provider/model through `opencode run`.
---

# OpenCode

Use the local `opencode` CLI only when the user explicitly asks for OpenCode.

Use only these model forms:

```bash
opencode run 'Reply with exactly: pong' --model=opencode/kimi-k2.6
opencode run 'Reply with exactly: pong' --model=opencode/gemini-3.1-pro
```

For another repo, add `--dir`:

```bash
opencode run 'Update the requested file only, then stop.' --model=opencode/kimi-k2.6 --dir /absolute/path/to/repo
```

After it runs, inspect the touched files and `git diff`. For read-only tasks, confirm there is no diff.
