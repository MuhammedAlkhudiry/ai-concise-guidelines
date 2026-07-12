---
name: tool-updates
description: External CLI tool updates using explicit ownership, installed-versus-current evidence, supported update commands, runtime-linked CLI recovery, and final repository health checks.
---

# Tool Updates

Update external CLI tools with explicit ownership, visible version evidence, and a final health check.

## Workflow

1. Inspect the current inventory first:

```bash
mise run tools:status
mise run tools:update:plan
```

2. Classify each item by status:
   - `update`: installed and stale; eligible for update.
   - `current`: installed and already current; leave it alone.
   - `unknown`: system-owned, app-owned, or no reliable latest source; do not update unless the user explicitly asks.
   - `optional` with `current: missing`: do not install unless the user explicitly asks to add that optional tool.
3. Run only the update commands listed by `tools:update:plan` for installed stale tools. Keep commands grouped by owner, such as Bun, Homebrew, mise, npm/global, self-updating CLI, app-owned, or system-owned.
4. After any runtime manager or Node upgrade, re-check global CLIs that live under that runtime. Reinstall missing global CLIs with their documented package source, then run any required install/doctor command for that CLI.
5. For app-owned tools, update the app through its own update path, then run the local sync command if a managed symlink needs refreshing.
6. For system-owned tools, report the owner and leave them alone unless the user approves switching ownership or running a system update path.
7. Run the status command again and confirm every installed updateable tool is `current` or intentionally left `unknown`:

```bash
mise run tools:status
```

8. Run the repo verification gate:

```bash
mise run check
```

## Report

Final output should include:

- Tools updated with old and new versions.
- Tools already current.
- Missing optional tools intentionally skipped.
- Unknown/app/system-owned tools intentionally left alone.
- Any warnings from update tools that need later attention.
- Verification commands and results.
