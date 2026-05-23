---
name: maestro-mobile-e2e
description: Create, refactor, stabilize, and verify Maestro mobile E2E flows for Expo, React Native, iOS, or Android apps. Use when the user mentions Maestro, mobile smoke tests, mobile E2E auth or core coverage, Expo dev-client E2E, or flaky Maestro flows.
---

# Maestro Mobile E2E

Use Maestro for repeatable mobile user journeys, not unit-level behavior.

## Workflow

1. Inspect existing Maestro flow locations (`.maestro/`, `maestro/`, `e2e/`, `tests/`), package scripts, QA docs, app id, fixture data, and current simulator or emulator state.
2. Keep each flow atomic: one setup path, one route or user journey, one assertion surface.
3. Extract repeated launch, setup, and login work into shared subflows that match the repo's existing structure.
4. Put each stable login role or auth state in its own login subflow.
5. Prefer visible text when it is the user-facing contract; use accessibility ids or `testID`s for icons, localized UI, repeated labels, dynamic UI, or stability-sensitive controls.
6. Verify a representative slice after changing shared flows.
7. Run the full suite only after the slice passes.

## Rules

- Use the repo's E2E scripts when they exist.
- Do not duplicate launch or login blocks across many flows.
- Do not chain unrelated screens through fragile back navigation when one-way route checks prove the same contract.
- Treat fixture data as part of the E2E contract; document the reset command, roles, records, and identifiers needed to repeat the run.
- Keep project-specific app ids, environment names, users, and records in the project QA docs or local flow files, not in this skill.
- Check official Maestro docs when syntax, flags, reports, selectors, or flow behavior are uncertain.
- Read `references/patterns.md` when creating or restructuring a Maestro suite.
