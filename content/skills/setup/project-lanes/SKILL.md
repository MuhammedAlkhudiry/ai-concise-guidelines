---
name: project-lanes
description: Canonical and task-worktree runtime provisioning, readiness, services, saved plans, simulator profiles, reset, and resource cleanup.
---

A lane is an isolated runtime environment attached to either a project's canonical clone or a disposable task worktree. The coding harness owns
worktree creation and deletion. `lanes` must not create, inspect, mutate, or remove Git branches, clones, or worktrees.

Before acting, read the narrowest relevant live `lanes` help. Treat live help as the sole authority for command names, syntax, options, installation,
and output.

## Workflow

1. Use identity `main` for the canonical clone. Its slot is always `0`, its resources are stable, and task cleanup must never remove them.
2. For a task worktree, choose a concise lowercase task name such as `excel-tree-import`; never use a branch name, path, or numbered lane as identity.
3. At task start in a worktree, provision an unregistered lane or repair an unhealthy one before project work. Treat missing lane state as setup work,
   not a reason to reduce task scope.
4. Keep every process, URL, database, service, secret-backed environment file, object-storage bucket, port, and simulator scoped to that identity.
5. Verify or repair only the current or explicitly selected environment. Audit the full registry only when the task covers it. Include mobile setup
   only when the work requires it.
6. Before the harness deletes a task worktree, run `lanes destroy <project> <task> --confirm`. Destruction removes resources and registry state but
   never removes project files or the worktree itself. Never destroy `main`.
7. Use $project-environment when the centrally owned environment contract is missing or broken.

## Managed services

Use `lanes` for runtime provisioning, environment repair, and managed services. In a managed environment, never edit, recreate, or replace `.env`,
`.env.testing`, or mobile `.env.local`, and never prefix their lane-derived values onto project commands. Repair them with `lanes repair`. Use the
project's own task runner—normally `mise`—for application commands such as checks, tests, and coverage; never add a generic `lanes run` path.
After backend changes that can affect queued execution, use `lanes services` to restart only the current lane's Horizon service before queue-related
verification or handoff; do not restart unrelated services.

Saved plans belong to the selected project, not to an individual runtime environment. The installed project catalog contains stable project metadata;
task environment registrations live only in external runtime state.

## Completion

- Provisioning or repair is complete when the selected environment verifies.
- Destruction is complete when its resources and registry entry are gone and the worktree remains untouched for the harness to delete.
- Fleet repair is complete when every registered environment passes audit.
