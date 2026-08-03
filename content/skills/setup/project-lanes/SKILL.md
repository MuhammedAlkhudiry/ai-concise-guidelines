---
name: project-lanes
description: Persistent clone-lane setup, status, verification, reset, and destruction.
---

A lane is a persistent, independent Git clone and saved Codex project with an isolated local environment.

Run `lanes --help` and the relevant subcommand help for the authoritative interface. Lane status reports availability (`available` or `occupied`)
separately from environment health (`ready`, `drifted`, or `broken`).

## Workflow

1. Work in the lane selected as the current Codex project and inspect it with `lanes status` before editing.
2. Refuse work when the lane contains another task's branch, changes, or an in-progress Git operation.
3. Keep the task branch and every process, URL, database, service, and simulator scoped to that lane.
4. Use `lanes verify` for the current or explicitly named lane. Use `lanes audit` only for an explicit fleet-wide environment audit.
5. Use `lanes add <project> [number]` to register and provision another local lane. Omit the number to use the first available positive integer. Pass
   `--branch <name>` to finish on a new local task branch created directly from the latest remote base branch without an upstream; otherwise the new
   lane remains detached and available.
6. Use `lanes setup <project>` to provision missing or non-ready available lanes and repair safe branch/push defaults in existing clones. It leaves
   occupied lane work unchanged.
7. Use `lanes destroy <project> <lane>` to atomically remove a lane from the local catalog and queue its external resources and renamed clone for
   durable background cleanup. Use `lanes cleanup status` to inspect pending work and `lanes cleanup retry` to retry failures.
8. Use `lanes release <project> <lane> --confirm` only after committing, stashing, or cleaning all Git work. It stops services, attaches the latest
   remote base branch, resets task data, provisions required resources, verifies the environment, and returns the lane to the available pool.
9. Use `lanes plans <list|show|path|archive|index>` to manage project-scoped saved plans. The current lane supplies the project identity; plans are
   not tied to an individual lane.
10. Use the matching `lanes` command to inspect, reset, or control services for existing lanes.
11. Use $project-environment when the repository-owned lane contract is missing or broken.

## Mobile Work

Simulator creation is off by default. Pass `--mobile` to `lanes add`, `lanes setup`, `lanes verify`, or `lanes release` only when the assigned task
involves mobile work. The flag provisions or verifies mobile dependencies and the lane simulator.

Installation preserves the local lane list. Committed project definitions provide remote, base branch, path pattern, and initial lanes only when a
project has no installed catalog entry yet.

Register each clone as its own Codex project named `<Emoji> <Project> · Lane <N>`. Use one project-specific emoji consistently; it identifies the
project, not lane readiness.

## Completion

- Current-lane repair is complete when `lanes verify` passes for that lane.
- Fleet setup or shared-runtime repair is complete when `lanes audit <project>` passes for every configured lane. Add `--mobile` only when every
  lane's mobile environment is intentionally active. Pending or failed cleanup jobs keep the audit incomplete until cleanup succeeds.
