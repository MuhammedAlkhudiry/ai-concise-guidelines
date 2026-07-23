---
name: project-environment
description: Persistent clone-lane environment automation: setup, mobile development, verification, reset, destruction, and isolated resources.
---

Keep project-specific environment behavior in the project repository. Use $project-lanes only for generic clone lifecycle, readiness, state, and
invocation; never edit its state directly.

## Workflow

1. Inspect repository instructions and existing environment automation. Map every mutable resource, including mobile resources, to one stable lane
   identity.
2. Write `PROJECT-LANES.md` with each resource's setup, reset, destruction, and verification ownership. Exclude generic lane and clone instructions.
3. Implement the Bun TypeScript entrypoints in a `project-lanes` subdirectory of the repository's scripts directory. Use the shared runtime for
   generic dependency installs, environment files, resource operations, Scout indexing, and common Laravel/Expo verification. Keep a compact adapter
   and project context under `lib/`, and only project-specific operations under `steps/`.
4. Run setup repeatedly and verify the current lane. Exercise reset or destruction only with authorization, and remove superseded setup paths only
   after the suite covers them.

## Entrypoints

| Entrypoint              | Contract                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `setup.ts`              | Idempotently provision backend and web resources without resetting task data.                                                |
| `mobile-development.ts` | Idempotently provision mobile dependencies, environment, ports, Metro, and exact simulator state through the shared runtime. |
| `verify.ts`             | Prove resource existence, ownership, configuration, and health; support `--mobile-development`.                              |
| `reset.ts`              | Reset task data while retaining the lane environment.                                                                        |
| `destroy.ts`            | Remove only lane-owned external resources; $project-lanes removes the clone.                                                 |

## Contract

- Treat `PROJECT_LANE_ID` and `PROJECT_LANE_NUMBER` as authoritative; never infer identity from the clone path or branch.
- Require `PROJECT_LANE_DEFINITION_ROOT` and the configured project root to agree.
- Load the module supplied by `PROJECT_LANES_RUNTIME_MODULE`; use the established installed runtime only when that variable is absent.
- Keep setup repeatable, non-destructive, isolated, and explicit when a contract is wrong. Do not mask a broken path with a fallback.
- Keep secrets out of tracked files and logs; use the project's established secret source.

Finish only when repeated setup is safe and `verify.ts --mobile-development` passes for the lane without borrowing another lane's URL, process,
service, data, port, or simulator.
