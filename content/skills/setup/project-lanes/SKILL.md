---
name: project-lanes
description: Persistent clone lanes for active projects: status, provisioning, verification, reset, recovery, and destruction.
---

Use `lanes` as the maintenance control plane. A lane is one persistent, independent Git
clone and saved Codex project with a stable local environment. Never create a disposable worktree,
use an active project's main clone as a lane, or edit the state registry directly.

## Start work

1. Work in the lane selected as the current Codex project.
2. Run `lanes status <project>` before editing.
3. Refuse work when that lane contains another task's branch, Git changes, or an in-progress Git operation.
4. Create or switch task branches with Git and keep every process, URL, database, service, and simulator scoped to the current lane.

## Maintain lanes

- `lanes setup [project]` creates missing clones and provisions all persistent backend and mobile resources.
- `lanes verify [project]` verifies every idle lane and refreshes readiness evidence.
- `lanes reset <project> <lane>` resets an idle, Git-empty lane without deleting its environment.
- `lanes destroy <project> <lane> --confirm` removes an idle lane's resources and clone. Destruction is not task cleanup.

Register every clone as its own Codex project and name it `<Emoji> <Project> · Lane <N>`, using one
consistent project-specific emoji, the configured project name, and the one-based lane number. The
emoji identifies the project; it does not indicate current readiness.

Each active project must use a canonical remote URL and keep its lane contract and compact lane
script suite on the base branch so every clone owns its setup, mobile development, verification,
reset, and destruction entry points. Every mutable local resource needs one stable lane identity,
setup owner, reset owner, destruction owner, and exact verification check.

Use $project-environment to create or repair that project-owned contract and script suite. Keep
project-specific environment behavior out of the generic `lanes` CLI.

Provisioning or repair is complete only when every configured path is an independent clone and
mobile and backend verification pass for each lane.
