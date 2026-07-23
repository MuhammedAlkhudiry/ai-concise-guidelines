# Lanes Menu

A native macOS menu-bar launcher for persistent project lanes.

## Boundary

This module is a thin native client for the installed `~/bin/lanes` JSON contracts. Lane status,
Site health, service lifecycle, logs, and editor/browser/Simulator actions are all owned by the CLI.
The widget contains no independent process manager or project-specific service discovery.

Frontend, Metro, and Horizon services use the project catalog installed by `my-setup`. Hovering a
service shows the CLI-managed log as selectable text.

The main installer integrates the app through one import and one `installLanesMenu()` call. The
module owns its Swift package, bundle metadata, build, installation, code signing, and login launch
agent.

## Removal

1. Remove the `installLanesMenu` import and call from `src/commands/install.ts`.
2. Delete `src/apps/lanes-menu`.
3. Remove the `swift` entries added to `src/lib/system-tools.ts`, `shell/doctor.zsh`, and
   `system-tools.md` if no other repository feature needs Swift.
4. Unload `~/Library/LaunchAgents/com.muhammed.lanes-menu.plist`, then delete that file and
   `~/Applications/Lanes.app`.
