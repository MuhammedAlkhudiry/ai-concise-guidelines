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
5. Use `lanes add <project> [number]` to register and provision another local lane. Omit the number to use the first available positive integer.
6. Use `lanes setup <project>` to provision missing or non-ready available lanes. It leaves occupied lanes unchanged.
7. Use `lanes destroy <project> <lane>` to destroy a lane and remove it from the local catalog.
8. Use `lanes release <project> <lane> --confirm` only when task work can be discarded. It stops services, cleans Git to the latest remote base
   branch, resets task data, provisions required resources, verifies the environment, and returns the lane to the available pool.
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
  lane's mobile environment is intentionally active.
