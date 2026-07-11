---
name: solo-cli
description: Solo CLI project and process management for status, lifecycle commands, process output, and explicit Solo requests.
---

For current syntax, run `solo --help` or `solo <command> --help`.

## Workflow

1. Check `solo doctor` or `solo status` when connection or discovery is uncertain.
2. Resolve current project IDs with `solo projects list --json`; never assume they are stable.
3. Use `--project-id` for project-scoped commands and `--json` when parsing output.
4. Get process IDs from `solo processes list` before process-specific actions or output reads.

```bash
solo doctor
solo projects list --json
solo projects get 2 --json
solo processes list --project-id 2 --json
solo commands start-all --project-id 2
solo commands stop-all --project-id 2
solo commands restart-all --project-id 2
solo processes restart <process-id>
solo processes output <process-id> --project-id 2 --lines 200 --raw
```
