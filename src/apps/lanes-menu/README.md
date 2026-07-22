# Lanes Menu

A native macOS menu-bar launcher for persistent project lanes.

## Boundary

This module reads the installed `~/bin/lanes status --json` contract, checks lane URLs directly for
Site health, and reads `~/.local/bin/solo processes list --json` for every lane command service. It
does not export code to the lanes or Solo runtimes or require app-specific fields in their data.
Editor, browser, and Simulator launches are implemented inside the app.

Frontend and Metro development commands are also independent from Solo. The app discovers their
package directories from each lane, runs only `bun dev`, records its own process IDs under
`~/Library/Application Support/Lanes/dev-commands`, and stops only processes it started.

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
