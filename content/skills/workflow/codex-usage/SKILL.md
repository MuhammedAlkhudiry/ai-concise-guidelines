---
name: codex-usage
description: Read live Codex rate-limit usage and reset times. Use when asked for current Codex weekly usage, remaining quota, limits, or reset time.
---

Query the signed-in account through `codex app-server --stdio`; do not estimate usage from tokens or logs, and do not use UI automation.

Use an inline Bun script to:

1. Spawn `codex app-server --stdio` with piped stdin and stdout.
2. Send newline-delimited JSON-RPC: an `initialize` request with client metadata, wait for its response, send the `initialized` notification, then
   send `{ "method": "account/rateLimits/read", "id": 2 }`.
3. Read newline-delimited responses until ID `2` arrives, print only its result, terminate the app-server process, and fail after a short timeout.

Interpret `rateLimitsByLimitId.codex`, falling back to `rateLimits`. A weekly window has `windowDurationMins: 10080`; report its `usedPercent`,
`100 - usedPercent` remaining, and its Unix-seconds `resetsAt` in the machine's local timezone. Report other named limits only when useful, and
clearly distinguish weekly windows from shorter windows. If the live request fails or the account is not signed in, report that exact blocker instead
of using stale local data.
