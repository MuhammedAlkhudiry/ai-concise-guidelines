---
name: qa-handoff
description: Prepare a repeatable manual QA handoff with coverage-focused test cases after implementation. Use when the user asks "how do I QA this?", "prepare QA path", "give me manual QA", "I want to test it", "give me test cases", or asks for QA handoff after a feature or fix is done.
---

# QA Handoff

Prepare the test cases a human should run to QA a completed change, existing feature, or named product flow.

## Workflow

1. Identify the QA target from the user request, feature notes, code, routes/screens/endpoints, related tests, project QA docs, and diff when one exists.
2. Map the coverage the user needs next: happy path, changed behavior, persistence, permissions, validation, boundaries, integrations, and regressions when relevant.
3. Confirm the local app is usable through the repo's allowed project flow.
4. Verify the QA URL responds before sharing it.
5. Create, reset, or confirm realistic test data with existing seeders, fixtures, factories, helper commands, or UI flows.
6. Reuse the implementation verification already done; run only a quick smoke check when the URL, login, fixture, or starting state is uncertain.
7. Write the smallest useful set of manual test cases the user can follow without guessing.

## Handoff

Include:

- `URL`: verified working URL and exact starting page.
- `Login / Test Data`: account, tenant, fixture, ids, and reset command or reset steps.
- `Test Cases`: 3-8 realistic cases ordered by risk and user value.
- `Already Verified`: implementation checks, URL checks, fixture setup, and any quick smoke checks already run.
- `Blocked / Skipped`: only checks blocked by missing services, missing credentials, unavailable devices, or deliberate scope limits.

## Coverage

- Use compact cases: `TC-01 - <title>` with priority, purpose, steps, and expected result.
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
- Use `qa-test-cases` instead when the user asks for a full test suite, automation-ready matrix, or executable case document.
- Use `post-implementation-review` instead when the user asks whether the change is ready to ship.
