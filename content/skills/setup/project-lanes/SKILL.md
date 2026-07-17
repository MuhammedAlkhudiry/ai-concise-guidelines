---
name: project-lanes
description: Persistent clone lanes for active projects: status, acquisition, release, reset, provisioning, verification, recovery, and destruction.
---

Use `my-setup lanes` as the only control plane. A lane is one persistent, independent Git clone
with a stable local environment. Never create a disposable worktree, use an active project's main
clone as a lane, or edit the state registry directly.

## Start work

1. Run `my-setup lanes status <project>` and choose work only through acquisition.
2. Run `my-setup lanes acquire <project> <branch> --task <task>`.
3. Work only in the returned lane path and keep every process, URL, database, service, and simulator scoped to that lane.
4. If acquisition reports no ready lane, refuse the new work and report every lane's state. Do not reclaim or reset another task's lane.

Acquisition is complete only when the lane is leased atomically, its environment passes project verification, and the task branch is checked out.

## Release work

1. Finish the task workflow and push every commit that must survive.
2. Run `my-setup lanes release <project> <lane>`.
3. Confirm `my-setup lanes status <project>` reports the lane as `READY`.

Release must refuse Git changes, unpushed commits, missing upstream branches, or an in-progress
Git operation. A successful release detaches at the current remote base, removes the local task
branch after proving its commits exist remotely, resets task data, preserves the environment, and
clears the lease.

## Maintain lanes

- `my-setup lanes setup [project]` creates missing clones and provisions all persistent backend and mobile resources.
- `my-setup lanes verify [project]` verifies every idle lane and refreshes readiness evidence.
- `my-setup lanes reset <project> <lane>` resets an idle, Git-empty lane without deleting its environment.
- `my-setup lanes destroy <project> <lane> --confirm` removes an idle lane's resources and clone. Destruction is not task cleanup.

Register every clone as its own Codex project and name it `<Emoji> <Project> · Lane <N>`, using one
consistent project-specific emoji, the configured project name, and the one-based lane number. The
emoji identifies the project; it does not indicate current readiness.

Each active project must use a canonical remote URL and keep its lane contract and compact lane
script suite on the base branch so every clone owns its setup, mobile development, verification,
reset, and destruction entry points. Every mutable local resource needs one stable lane identity,
setup owner, reset owner, destruction owner, and exact verification check.

Provisioning or repair is complete only when all configured lanes are independent clones, mobile
and backend verification pass for each lane, three simultaneous acquisitions succeed, a fourth
acquisition is refused without state changes, and released lanes can be acquired again.
