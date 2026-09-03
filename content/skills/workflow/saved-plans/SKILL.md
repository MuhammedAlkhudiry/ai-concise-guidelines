---
name: saved-plans
description: Saved-plan persistence and lifecycle management for code and non-code tasks.
---

When the user explicitly asks to persist or manage a plan, use the established writable plan store available in the environment and preserve the
supplied content. When `lanes` is available, run `lanes plans --help` and follow its contract. Otherwise use the connected repository's existing plan
location. When no writable plan store exists, return the complete plan and state that it was not persisted.

## Saved Plan Status

- Use `pending` for work that has not started, `progress` for work currently underway, and `done` for completed work.
- New plans default to `pending` when status is absent.
- Archive completed plans through the active plan store; bulk archive selects plans whose status is `done`.
