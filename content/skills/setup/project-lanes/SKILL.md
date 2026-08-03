---
name: project-lanes
description: Persistent clone-lane lifecycle, readiness, service control, CI and pull requests, saved plans, simulator profiles, and cleanup.
---

A lane is a persistent, independent Git clone and saved Codex project with an isolated local environment.

Before acting, read the narrowest relevant live `lanes` help. Treat live help as the sole authority for command names, syntax, options, installation,
and output. Lane status reports availability separately from environment health.

## Workflow

1. Inspect the selected lane before editing. Refuse work when it contains another task's branch, changes, or an in-progress Git operation.
2. Keep the task branch and every process, URL, database, service, and simulator scoped to the lane.
3. When a new lane should begin task work immediately, finish creation on a new local task branch based on the latest remote base without an upstream.
   Otherwise leave it detached and available. Treat a task branch that tracks the remote base branch as unsafe and repair it before any push.
4. Verify only the current or explicitly selected lane. Run a fleet-wide audit only when the assignment explicitly covers the fleet. Include mobile
   provisioning or verification only when the assigned work requires it.
5. Release only after committing, stashing, or cleaning all Git work. Destroy only an available lane. Pending or failed durable cleanup keeps the
   lifecycle operation incomplete.
6. Use $project-environment when the repository-owned environment contract is missing or broken.

Saved plans belong to the project selected by the current lane, not to an individual lane. Installation preserves locally added or removed lanes while
refreshing committed project defaults.

Register each clone as its own Codex project named `<Emoji> <Project> · Lane <N>`. Use one project-specific emoji consistently; it identifies the
project, not lane readiness.

## Completion

- Current-lane repair is complete when its verification passes.
- Fleet setup or shared-runtime repair is complete when every configured lane passes audit and no relevant cleanup job remains pending or failed.
