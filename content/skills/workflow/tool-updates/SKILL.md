---
name: tool-updates
description: External CLI tool updates using explicit ownership, supported update commands, runtime-linked CLI recovery, repository health checks, and concise release-note summaries of what changed.
---

# Tool Updates

Update external CLI tools with explicit ownership, visible version evidence, a final health check, and a useful summary of what is new.

## Workflow

1. Run `my-setup tools status`, then `my-setup tools update-plan`. Treat their live output as the inventory, ownership, status, and supported-update authority.
2. Run only the eligible update commands printed by the update plan. Do not install missing optional tools or update unknown, app-owned, or system-owned tools unless the user explicitly expands scope.
3. After any runtime-manager or Node upgrade, re-check global CLIs under that runtime. Repair missing runtime-linked commands from their documented package source, then run their supported install or doctor path.
4. Re-run `my-setup tools status` and resolve every eligible stale item or report its exact blocker.
5. Apply $verification for the owning setup repository.
6. For each updated tool, read its official release notes or changelog for the versions crossed.
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
