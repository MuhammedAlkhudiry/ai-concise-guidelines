---
name: project-lanes
description: Persistent clone-lane setup, status, verification, reset, and destruction.
---

A lane is a persistent, independent Git clone and saved Codex project with an isolated local environment.

Run `lanes --help` and the relevant subcommand help for the authoritative interface. Lane status
reports availability (`available` or `occupied`) separately from environment health (`ready`,
`drifted`, or `broken`).

## Workflow

1. Work in the lane selected as the current Codex project and inspect it with `lanes status` before editing.
2. Refuse work when the lane contains another task's branch, changes, or an in-progress Git operation.
3. Keep the task branch and every process, URL, database, service, and simulator scoped to that lane.
4. Use `lanes verify` for the current or explicitly named lane. Use `lanes audit` only for an explicit fleet-wide environment audit.
5. Use the matching `lanes` command to set up, inspect, reset, or destroy lanes.
6. Use $project-environment when the repository-owned lane contract is missing or broken.

Register each clone as its own Codex project named `<Emoji> <Project> · Lane <N>`. Use one
project-specific emoji consistently; it identifies the project, not lane readiness.

## Completion

- Current-lane repair is complete when `lanes verify` passes for that lane.
- Fleet setup or shared-runtime repair is complete when `lanes audit <project>` passes for every configured lane. Add `--mobile` only when every lane's mobile environment is intentionally active.
