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
4. Treat runnable access as a handoff gate: never infer a URL, device, or starting state; verify the exact target in the target environment before sharing it.
5. For web handoffs, identify the canonical checkout or secondary worktree.
6. If the needed clone or worktree was removed, recreate it through the repo's supported project flow and complete setup before continuing.
7. Confirm DDEV is running in the exact checkout, then verify the exact URL with a browser load, `curl`, or a project health check before sharing it.
8. For mobile handoffs, confirm the simulator or emulator is running, the app is installed or freshly built, the app launches successfully, and the target screen or starting state is reachable.
9. Create, reset, or confirm realistic test data with existing seeders, fixtures, factories, helper commands, or UI flows.
10. Reuse the implementation verification already done; run only a quick smoke check when the URL, login, fixture, or starting state is uncertain.
11. Write right-sized manual cases the user can run without guessing.

## Handoff

- `URL / Device`: verified responding DDEV URL for the current checkout or worktree and exact starting page for web.
  For mobile, include the working simulator or emulator, installed app/build, launch status, and reachable app state.
- `Login / Test Data`: account, tenant, fixture, ids, exact data, and reset command or steps.
- `Test Cases`: 3-8 realistic cases ordered by risk and user value.
- `Already Verified`: exact URL proof, migration status, fixture setup, smoke checks, and implementation checks already run.
- `Blocked / Skipped`: only checks blocked by missing services, credentials, devices, or deliberate scope limits.

- Use runnable cases: `TC-01 - <title>` with priority, purpose, steps, and expected result.
- Name the visible outcome, saved state, event, email, job, or API response that proves the case worked.
- Cover relevant happy path, changed behavior, validation, permission, boundary, persistence, integration, and regressions.

- Prefer real project fixtures over invented data.
- Give exact paths, labels, records, and commands.
- Format URLs and file references as clickable Markdown links whenever possible.
- For secondary worktrees, name the worktree path or project identifier used to derive the URL.
- Do not include a web URL unless `Already Verified` names the exact URL checked and proof: HTTP status, page title, or health check result.
- If a URL does not respond or the mobile app is not installed, launched, and reachable, fix setup first or mark the handoff blocked.
- Do not hand over route lists or vague QA paths; make every case runnable and observable.
- Do not duplicate implementation verification as user-run cases; list completed checks under `Already Verified`.
- Do not repeat full implementation details, logs, or generic QA theory.
- Use `/workflow qa-test-cases` for a full suite or executable case document, and `prepare-release` for release preparation.
