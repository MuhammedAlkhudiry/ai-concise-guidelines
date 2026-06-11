---
name: qa-handoff
description: Manual QA handoff after a feature or fix, covering how do I QA this, prepare QA path, give me manual QA, I want to test it, and give me test cases prompts.
---

# QA Handoff

Prepare the test cases a human should run to QA a completed change, existing feature, or named product flow.

## Workflow

1. Identify the QA target from the user request, feature notes, code, routes/screens/endpoints, related tests, project QA docs, and diff when one exists.
2. Map the coverage the user needs next: happy path, changed behavior, persistence, permissions, validation, boundaries, integrations, and regressions when relevant.
3. Confirm the local app is usable through the repo's allowed project flow, and confirm local migrations have run when the QA target depends on database schema or seeded state.
4. For web handoffs, ensure DDEV is running and share a responding DDEV URL, not localhost; for mobile handoffs, confirm the simulator or emulator is running and usable.
5. Create, reset, or confirm realistic test data with existing seeders, fixtures, factories, helper commands, or UI flows.
6. Reuse the implementation verification already done; run only a quick smoke check when the URL, login, fixture, or starting state is uncertain.
7. Write the smallest useful set of manual test cases the user can follow without guessing.

## Handoff

Include:

- `URL / Device`: verified responding DDEV URL and exact starting page for web; working simulator or emulator and app state for mobile.
- `Login / Test Data`: account, tenant, fixture, ids, exact test data, and reset command or reset steps.
- `Test Cases`: 3-8 realistic cases ordered by risk and user value.
- `Already Verified`: implementation checks, local migration status when relevant, URL checks, fixture setup, and any quick smoke checks already run.
- `Blocked / Skipped`: only checks blocked by missing services, missing credentials, unavailable devices, or deliberate scope limits.

## Coverage

- Use runnable cases: `TC-01 - <title>` with priority, purpose, steps, and expected result.
- Name the visible outcome, saved state, event, email, job, or API response that proves the case worked.
- Cover only relevant happy path, changed behavior, validation, permission, boundary, persistence, integration, and nearby regression cases.

## Rules

- Keep this practical, not exhaustive.
- Cover the change, not every possible regression.
- Prefer real project fixtures over invented data.
- Give exact paths, labels, records, and commands.
- Include negative, edge, permission, and integration cases only when the change can realistically fail there.
- Do not hand over route lists or vague QA paths; make every case runnable and observable.
- Do not duplicate implementation verification as user-run cases; list completed checks under `Already Verified`.
- Do not repeat full implementation details, test logs, or generic QA theory.
- Use `/workflow qa-test-cases` instead when the user asks for a full test suite, automation-ready matrix, or executable case document.
- Use `deploy-readiness` instead when the user asks whether the change is ready to ship.
