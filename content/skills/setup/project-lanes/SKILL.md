---
name: project-lanes
description: Persistent clone lanes for active projects: status, provisioning, verification, reset, recovery, and destruction.
---

Use `lanes` as the maintenance control plane. A lane is one persistent, independent Git
clone and saved Codex project with a stable local environment. Never create a disposable worktree,
use an active project's main clone as a lane, or edit the state registry directly.

Run `lanes --help` and the relevant subcommand help for the current command interface. Use
$project-environment for the project-owned provisioning contract.

## Start work

1. Work in the lane selected as the current Codex project.
2. Use the current status subcommand to inspect the project before editing.
3. Refuse work when that lane contains another task's branch, Git changes, or an in-progress Git operation.
4. Create or switch task branches with Git and keep every process, URL, database, service, and simulator scoped to the current lane.

## Maintain lanes

Use the matching live subcommand for setup, verification, reset, or destruction. Before reset or
destruction, resolve the exact project and lane from live status, require an idle Git-empty target,
and preserve the distinction between resetting task data and removing lane-owned resources.

Register every clone as its own Codex project and name it `<Emoji> <Project> · Lane <N>`, using one
consistent project-specific emoji, the configured project name, and the one-based lane number. The
emoji identifies the project; it does not indicate current readiness.

Each active project must use a canonical remote URL and keep its lane contract and compact lane
script suite on the base branch so every clone owns its setup, mobile development, verification,
reset, and destruction entry points. `lanes` supplies the shared project-environment runtime; the
repository entry points own lifecycle ordering and project-specific behavior. Every mutable local
resource needs one stable lane identity, setup owner, reset owner, destruction owner, and exact
verification check.

Use $project-environment to create or repair that project-owned contract and script suite. Keep
project-specific environment behavior out of the shared runtime and generic `lanes` CLI.

Provisioning or repair is complete only when every configured path is an independent clone and
mobile and backend verification pass for each lane.
