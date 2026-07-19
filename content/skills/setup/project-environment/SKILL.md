---
name: project-environment
description: "Project-owned local environment automation for persistent clone lanes: create, repair, or review the repository contract and setup, mobile-development, verification, reset, and destruction scripts with isolated resources."
---

Own the environment behavior inside the project repository. Apply $project-lanes only for generic
clone lifecycle, readiness, state, and invocation; do not put project-specific provisioning in the
`lanes` CLI or edit its state.

## Build or repair

1. Read repository instructions and exhaustively discover setup surfaces: docs, process config,
   environment examples, services, databases, caches, queues, storage, search, mail, migrations,
   seeders, code generation, package scripts, lockfiles, and existing setup code.
2. Include mobile surfaces when present: framework config, environment files, Metro, simulators,
   app identifiers, schemes, native dependencies, and device selection.
3. Define one stable lane identity and map every mutable local resource to it.
4. Write `PROJECT-LANES.md` as the repository contract.
5. Implement the Bun TypeScript entrypoints in a `project-lanes` subdirectory of the repository's
   scripts directory. Inspect the module supplied by `PROJECT_LANES_RUNTIME_MODULE` and reuse its
   current exports for generic mechanics.
6. Run setup and verification in the current authorized lane. Exercise reset or destruction only
   when the user has authorized their data or resource effects.
7. Remove superseded setup paths only after the project-owned suite covers them.

## Required entrypoints

- `setup.ts` idempotently provisions backend and web resources without resetting existing task data.
- `mobile-development.ts` idempotently provisions mobile-only dependencies, environment, ports, and simulator state.
- `verify.ts` proves resource existence, ownership, configuration, and health; support
  `--mobile-development` for the mobile checks.
- `reset.ts` resets task data while retaining the lane environment.
- `destroy.ts` removes only lane-owned external resources; `$project-lanes` removes the clone.

Keep a compact runtime adapter and project context under `lib/`. Treat the supplied shared module as
the source of truth for its helper surface; do not copy its implementation or helper catalog into
the skill or repository. Put only project-specific provisioning operations under `steps/`.

## Contract rules

- Derive identity from the configured clone path or environment variable, never the current branch.
- Treat the project root passed by `PROJECT_LANE_DEFINITION_ROOT` and the configured project-specific
  environment variable as the authoritative clone root.
- Load the shared module passed by `PROJECT_LANES_RUNTIME_MODULE`; direct entrypoints may use the
  established installed runtime path when the orchestrator variable is absent.
- Give every mutable resource one stable lane-specific name, setup owner, reset owner, destruction
  owner, and exact verification check.
- Cover URLs and certificates, databases, Redis/session/queue identifiers, search and storage
  namespaces, process-manager projects, environment files, dependency markers, ports, and simulators
  when the project uses them.
- Keep setup repeatable and non-destructive. Fail clearly when a required resource or contract is
  wrong; do not hide a broken intended path behind a fallback.
- Keep secrets out of tracked files and logs. Copy or derive local values only through the project's
  established secret source.
- Document each resource and its verification in `PROJECT-LANES.md`; do not duplicate generic lane
  status or clone-management instructions there.

Finish only when repeated setup is safe and `verify.ts --mobile-development` passes for the lane
without borrowing another lane's URL, process, service, data, port, or simulator.
