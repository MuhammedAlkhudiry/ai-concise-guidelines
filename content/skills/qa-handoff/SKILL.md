---
name: qa-handoff
description: Prepare a repeatable manual QA path after implementation. Use when the user asks "how do I QA this?", "prepare QA path", "give me manual QA", "I want to test it", or asks for QA handoff after a feature or fix is done.
---

# QA Handoff

Prepare the path a human should follow to QA a completed change, existing feature, or named product flow.

## Workflow

1. Identify the QA target from the user request, feature notes, code, routes/screens/endpoints, related tests, project QA docs, and diff when one exists.
2. Confirm the local app is usable through the repo's allowed project flow.
3. Verify the QA URL responds before sharing it.
4. Create, reset, or confirm realistic test data with existing seeders, fixtures, factories, helper commands, or UI flows.
5. Reuse the implementation verification already done; run only a quick smoke check when the URL, login, fixture, or starting state is uncertain.
6. Write the smallest complete manual handoff the user can follow without guessing.

## Handoff

Include:

- `URL`: verified working URL and exact starting page.
- `Login / Test Data`: account, tenant, fixture, ids, and reset command or reset steps.
- `QA Paths`: 3-7 realistic paths ordered by risk and user value.
- `Expected Results`: visible outcomes, saved state, events, emails, jobs, or API responses that prove the path worked.
- `Already Verified`: implementation checks, URL checks, fixture setup, and any quick smoke checks already run.
- `Blocked / Skipped`: only checks blocked by missing services, missing credentials, unavailable devices, or deliberate scope limits.

## Rules

- Keep this practical, not exhaustive.
- Prefer real project fixtures over invented data.
- Give exact paths, labels, records, and commands.
- Include negative or edge paths only when the change can realistically fail there.
- Do not repeat full implementation details, test logs, or generic QA theory.
- Use `qa-test-cases` instead when the user asks for a full test suite or executable case document.
- Use `deploy-readiness` instead when the user asks whether the change is ready to ship.
