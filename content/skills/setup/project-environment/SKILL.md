---
name: project-environment
description: Canonical-clone and task-lane environment setup, mobile development, verification, reset, destruction, and isolated resources.
---

Keep every active project's environment adapter in the shared project-environment runtime. Project repositories must not contain lane lifecycle
scripts or a `PROJECT-LANES.md`. Use $project-lanes for runtime lifecycle, readiness, state, and invocation; never edit its state directly.

## Workflow

1. Inspect the central project adapter, active-project declaration, repository task definitions, and current environment files. Map every mutable
   resource—including development and testing databases, object storage, Herd TLS, ports, and mobile resources—to one stable environment identity.
2. Update the central adapter for project-specific setup, mobile development, verification, reset, and destruction. Reuse the shared runtime for
   dependency installs, managed environment files, resources, Scout indexing, and common Laravel or Expo verification.
3. Keep project repositories focused on application commands. Remove duplicated lane scripts, lifecycle tasks, and instructions after central
   ownership covers them.
4. Run repair repeatedly and verify the current lane. Exercise reset or destruction only with authorization.

## Environment ownership

- Store project secrets and generated environment files under `SERVICE_CREDENTIALS_HOME`, outside every Git repository. The canonical clone and each
  managed task worktree receive `.env`, `.env.testing`, and mobile `.env.local` links into that store.
- Preserve existing values during the first migration. Move declared real secrets into the project-level secret file without printing their values.
- Derive lane URLs, database names, cache prefixes, buckets, ports, simulator names, local service credentials, and safe testing defaults centrally.
- Treat managed environment links as lane-generated state. Never edit, recreate, or replace them, and never prefix their values onto project commands.
  Repair them with `lanes repair`.
- Keep ephemeral command outputs, such as coverage directories, inside the project task implementation. Do not turn project tasks into `lanes`
  subcommands.

## Contract

- Treat `PROJECT_LANE_ID` and `PROJECT_LANE_NUMBER` as authoritative; never infer identity from a path or branch. The id is `main` or a clear task
  name; the number is an internal resource slot, not user-facing identity.
- Use identity `main` and slot `0` for the canonical clone. Its resources are stable project infrastructure and must never be removed by task-lane
  cleanup.
- Require `PROJECT_LANE_DEFINITION_ROOT` and the configured project root to agree.
- Keep setup repeatable, non-destructive, isolated, and explicit when a contract is wrong. Do not mask a broken path with a fallback.
- Setup owns lane storage repair; verification stays read-only. Preserve catalog assets during resets, scope object cleanup safely, and delete buckets
  only during destruction.
- Derive the Laravel testing database from the lane prefix and let Laravel append its parallel process token; never use a shared `testing` database.
- Treat the lane's Herd certificate and key as required resources. Fail verification when either is missing.
- Preserve every simulator service required by the project's user-visible integrations. Treat services marked always enabled by SimSlim as mandatory.

Finish only when repeated repair is safe and the selected lane verifies without borrowing another lane's URL, process, service, data, port, secret, or
simulator.
