---
name: qa-handoff
description: Manual QA handoff after a feature or fix, covering how do I QA this, prepare QA path, give me manual QA, I want to test it, and give me test cases prompts.
---

# QA Handoff

Prepare runnable human QA cases for a completed change, feature, or product flow.

## Workflow

1. Identify the QA target from the request, feature notes, code, routes/screens/endpoints, tests, QA docs, and diff when one exists.
2. Map needed coverage: happy path, changed behavior, persistence, permissions, validation, boundaries, integrations, and regressions.
3. Confirm the local app is usable through the repo's allowed project flow, and confirm local migrations have run when the QA target depends on database schema or seeded state.
4. For web handoffs, identify the canonical checkout or secondary worktree, confirm DDEV is running there, and share a clickable responding DDEV URL from that exact checkout; never substitute the canonical URL for a worktree.
5. For mobile handoffs, confirm the simulator or emulator is running and usable.
6. Create, reset, or confirm realistic test data with existing seeders, fixtures, factories, helper commands, or UI flows.
7. Reuse the implementation verification already done; run only a quick smoke check when the URL, login, fixture, or starting state is uncertain.
8. Write right-sized manual cases the user can run without guessing.

## Handoff

- `URL / Device`: verified responding DDEV URL for the current checkout or worktree and exact starting page for web.
  For mobile, include the working simulator or emulator and app state.
- `Login / Test Data`: account, tenant, fixture, ids, exact test data, and reset command or reset steps.
- `Test Cases`: 3-8 realistic cases ordered by risk and user value.
- `Already Verified`: implementation checks, local migration status when relevant, URL checks, fixture setup, and any quick smoke checks already run.
- `Blocked / Skipped`: only checks blocked by missing services, missing credentials, unavailable devices, or deliberate scope limits.

- Use runnable cases: `TC-01 - <title>` with priority, purpose, steps, and expected result.
- Name the visible outcome, saved state, event, email, job, or API response that proves the case worked.
- Cover only relevant happy path, changed behavior, validation, permission, boundary, persistence, integration, and nearby regression cases.

- Keep this practical, not exhaustive.
- Cover the change, not every possible regression.
- Prefer real project fixtures over invented data.
- Give exact paths, labels, records, and commands.
- Format URLs and file references as clickable Markdown links whenever possible.
- For secondary worktrees, name the worktree path or project identifier used to derive the URL.
- Include negative, edge, permission, and integration cases only when the change can realistically fail there.
- Do not hand over route lists or vague QA paths; make every case runnable and observable.
- Do not duplicate implementation verification as user-run cases; list completed checks under `Already Verified`.
- Do not repeat full implementation details, logs, or generic QA theory.
- Use `/workflow qa-test-cases` for a full suite or executable case document, and `deploy-readiness` for ship-readiness.
