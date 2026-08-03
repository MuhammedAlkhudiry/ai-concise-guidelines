# AI Usage Menu

A native macOS menu-bar app for at-a-glance Codex, OpenCode Go, and Claude usage.

The app collects provider-owned data directly instead of adding a shared CLI contract:

- Codex allowance and reset windows come from the newest rate-limit snapshot in local Codex sessions.
- OpenCode Go shows rolling, weekly, and monthly allowance by reading the existing OpenCode session from Chrome's native cookie store on every refresh.
- Claude shows live five-hour and weekly allowance through the OAuth session already stored by Claude Code in macOS Keychain.

OpenCode authentication stays in Chrome and is never copied into the app's preferences. The app reads Chrome Safe Storage through macOS Keychain only when decrypting the current OpenCode cookie.
