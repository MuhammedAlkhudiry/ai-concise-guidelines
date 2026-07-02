---
name: solo-cli
description: Solo CLI project and process management, including Solo project status, dev server start/inspection, process logs, Solo HTTP fallback, and explicit Solo requests.
---

# Solo CLI

Use `solo` first for Solo-managed projects and dev processes. For current syntax, run `solo --help` or `solo <command> --help`.

## Workflow

1. Check `solo doctor` or `solo status` when connection or discovery is uncertain.
2. Run `solo projects list --json` to get current project IDs.
3. Use `--project-id` for project-scoped commands and `--json` when parsing output.
4. Get process IDs from `solo processes list` before process-specific actions.

```bash
solo doctor
solo projects list --json
solo projects get 2 --json
solo processes list --project-id 2 --json
solo commands start-all --project-id 2
solo commands stop-all --project-id 2
solo commands restart-all --project-id 2
solo processes restart <process-id>
```

Verify IDs with `solo projects list --json`; do not assume they are stable.
