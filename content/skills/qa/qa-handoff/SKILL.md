---
name: qa-handoff
description: Manual QA handoff after a feature or fix, including QA paths, human-run test cases, and release testing notes.
---

Prepare runnable human QA cases for a completed change, feature, or product flow.

## Workflow

1. Identify the QA target from the request, feature notes, code, routes/screens/endpoints, tests, QA docs, and diff.
2. Map needed coverage: happy path, changed behavior, persistence, permissions, validation, boundaries, integrations, and regressions.
3. Confirm the local app is usable through the repo's supported flow, including migrations when schema or seed data matters.
4. Treat runnable access as a handoff gate: verify the exact URL, device, and starting state before sharing them.
5. For web, use the canonical checkout or secondary worktree, discover the active dev server, and verify the starting page with a browser load, `curl`, or health check.
6. For mobile, confirm the simulator/emulator, installed app or fresh build, launch state, and reachable target screen.
7. Create, reset, or confirm realistic test data with existing seeders, fixtures, factories, helper commands, or UI flows.
8. Reuse implementation verification; run only a quick smoke check when URL, login, fixture, or starting state is uncertain.
9. Write short manual cases the user can run without guessing.

## Rules

- `URL / Device`: verified responding URL for the current checkout or worktree and exact starting page for web.
  For mobile, include the working simulator or emulator, installed app/build, launch status, and reachable app state.
- `Login / Test Data`: account, tenant, fixture, ids, exact data, and reset command or steps.
- `Test Cases`: 2-5 basic cases ordered by risk and user value.
- `Already Verified`: exact URL proof, migration status, fixture setup, smoke checks, and implementation checks already run.
- `Blocked / Skipped`: only checks blocked by missing services, credentials, devices, or deliberate scope limits.
- Use concise runnable cases: `TC-01 - <title>` with only steps and expected result.
- Name the visible outcome, saved state, event, email, job, or API response that proves the case worked.
- Cover relevant happy path, changed behavior, validation, permission, boundary, persistence, integration, and regressions.
- Prefer real project fixtures over invented data.
- Give exact paths, labels, records, and commands.
- Format URLs and file references as clickable Markdown links whenever possible.
- For secondary worktrees, name the worktree path or project identifier used to discover the URL.
- Do not include a web URL unless `Already Verified` names the exact checked URL and proof: HTTP status, page title, or health check result.
- If a URL does not respond or the mobile app is not installed, launched, and reachable, fix setup first or mark the handoff blocked.
- Do not hand over route lists or vague QA paths; make every case runnable and observable.
- Do not duplicate implementation verification as user-run cases; list completed checks under `Already Verified`.
- Do not repeat full implementation details, logs, or generic QA theory.
- Use `/workflow qa-test-cases` for a full suite or executable case document, and `prepare-release` for release preparation.
