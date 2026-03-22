# Verification Checklist Template

Repo-root `CHECKLIST.md` should be a plain command list.

```text
bun run typecheck
bun run lint
bun run format:check
bun run test
# optional when browser flows change: bun run test:e2e
```

Rules:

- One runnable verification command per line.
- Keep only commands the agent should actually run.
- Use `#` comments only for short optional conditions.
- Replace the example commands with repo-specific commands.
