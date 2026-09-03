---
name: codex-usage
description: Read live Codex rate-limit usage and reset times. Use when asked for current Codex weekly usage, remaining quota, limits, or reset time.
---

Run `codex-usage` and report its output; read `codex-usage --help` first. It queries the signed-in account through the Codex app server, so never
estimate usage from tokens, logs, or UI automation.

Distinguish the weekly window from shorter windows, and report each window's used and remaining percentages with its reset time in the machine's local
timezone. If the command fails or the account is not signed in, report that exact blocker instead of using stale local data.
