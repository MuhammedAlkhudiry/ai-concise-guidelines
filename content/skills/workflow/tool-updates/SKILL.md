---
name: tool-updates
description: External CLI tool updates using explicit ownership, supported update commands, runtime-linked CLI recovery, repository health checks, and concise release-note summaries of what changed.
---

# Tool Updates

Update external CLI tools with explicit ownership, visible version evidence, a final health check, and a useful summary of what is new.

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

9. For each updated tool, read its official release notes or changelog for the versions crossed.
   Identify notable new capabilities, behavior or configuration changes, breaking changes, and meaningful bug or security fixes.
   Do not infer changes when official notes are unavailable.

## Report

Give a short summary focused on what is new:

- For each updated tool, its old and new versions followed by the notable release-note changes relevant to the user.
- Repairs needed because an update removed or broke a runtime-linked CLI.
- Failed or skipped eligible updates and warnings that need user attention.
- One compact verification outcome; include command details only when something failed.

Omit dependency bumps, internal refactors, routine maintenance, and changes irrelevant to the current setup.
Do not list tools that were already current, missing optional tools, or unchanged unknown/app/system-owned tools.
If release notes cannot be found for an updated tool, say so briefly instead of guessing.
If nothing changed and no action is needed, say that no updates were needed.
