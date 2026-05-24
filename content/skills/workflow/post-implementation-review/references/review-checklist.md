# Post Implementation Review Checklist

## Simplification

- Preserve outputs, side effects, and real contracts. Do not preserve incidental structure.
- For every line, ask whether it still has a job.
- Remove dead code, stale branches, obsolete helpers, compatibility leftovers, comments about removed logic, and one-off abstractions.
- It is ok to create, move, split, or merge files when that is the simpler end state.
- Inline wrappers, aliases, pass-through helpers, one-use values, and variables that only rename an expression.
- In JSX/TSX, reduce prop plumbing and pass-through props; let children compute or read clean local data when that is simpler.
- Replace mode and boolean props with simpler component shape, composition, or local conditional render when possible.
- Flatten nesting with early returns and guard clauses. Never use nested ternaries.
- Treat new helpers, fallback paths, guards, retries, null cushions, shims, and normalization layers as guilty until tied to a real boundary.

## Test Cleanup

Delete, rewrite, or merge tests when the remaining suite still protects the behavior and the candidate is removed, duplicated, coupled to implementation details, or fixture/setup noise.

Do not delete without stronger proof when a test covers:

- A real bug regression.
- A public contract: API, CLI, event, serialized payload, DB shape, or cross-system behavior.
- Security, auth, permissions, money, destructive actions, or irreversible state changes.
- Boundary behavior such as empty, limit, timezone, rounding, or failure-path handling.
- Integration with external services, queues, jobs, storage, or framework wiring.
- A flaky test where the cause is still unknown.

## Verification And Readiness

- Use repo-root `CHECKLIST.md` when it exists.
- Prefer safe auto-fix commands when available.
- Keep task-specific checks out of `CHECKLIST.md`.
- For browser work, verify the relevant URL responds before sharing it.
- For mobile work, verify the simulator/device, installed app, Metro or native runtime, and the changed screen or starting state.
- For API/client work, verify both payload shape and the consumer path that uses it.
- For jobs, queues, storage, mail, webhooks, cache, search, or realtime work, verify the local service state needed for the change.
- For branch syncs and conflict resolution, compare the branch to the target base and verify the merged surfaces still work.

## Deploy Readiness

1. Inspect touched code paths and relevant callers.
2. Verify the checks that match the changed surface.
3. Look for change-specific rollout risks, data risks, cache/state risks, background-job risks, permission risks, and user-visible regressions.
4. Assume routine deploy-script chores are already handled, such as migrations, cache refreshes, queue restarts, and asset deployment.
5. Lead with the verdict: ready, not ready, or ready with named caveats.
