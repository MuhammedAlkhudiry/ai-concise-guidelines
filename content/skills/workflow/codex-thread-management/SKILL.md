---
name: codex-thread-management
description: Codex task and workspace hygiene for one-off or scheduled cleanup, including stale-task archiving, pin management, summaries, and safe stale-clone or worktree removal.
---

Read `references/cleanup.md` before changing tasks, automations, clones, or worktrees.

Use Codex task tools for task state and the automation tool for schedules. Protect pinned tasks and the keeper checkout.
Inventory destructive filesystem work first, preserve dirty candidates without explicit wipe approval, and verify the final task and workspace state.
