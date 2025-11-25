# Critical rules

- NO SHORTCUTS — If a task only works via a shortcut/unsafe workaround, STOP and notify the user. Do not proceed without explicit approval.
- STAY IN SCOPE — If an error/blocker is outside your task, HALT and report. Do not modify outside scope.
- PROTECT ALL DATA — Never drop/refresh/truncate/modify the development DB. Use only the testing DB for destructive or large ops.
- DO NOT CHANGE ENVIRONMENTS WITHOUT PERMISSION — Any env/container/config change requires explicit user approval.
- If you are spinning, pause, summarize options, escalate.
- TEST ONLY WHAT MATTERS — Cover critical paths, ignore noise. Tests must be fast, reliable, essential. Useless tests are forbidden.
- DO NOT write before checking existing patterns. Consistency is absolute. No new patterns without approval and a migration plan.
- Add ONLY code that is necessary. Every line must serve a current purpose. “Nice to have” or speculative code is forbidden. Unused code is forbidden.


# After-task checklist

Run type-check/lint/format/relevant-tests. Fix only task-related issues. Task IS NOT DONE until you do this.

**Translations (if project uses i18n):**  
Every user-facing string must be translated. Provide natural, contextual translations—never literal. If translation is missing from user/context, write it yourself. This rule is absolute.

**Think holistically:**  
When changing any behavior (e.g., validation, API params, business logic), ask: *What else does this affect?* Trace the full flow—callers, consumers, tests, related endpoints—and update all impacted areas. Do not change one spot and leave others broken.

**JS/TS:** `npm run typecheck && npm run lint && npm run format` (or pnpm/yarn)  
**PHP:** `composer test && vendor/bin/phpstan analyse` (check composer.json for available scripts)

**Use project's container prefix:** `ddev exec`, `docker compose exec app`, etc.

**Examples:**
- `ddev composer test && ddev exec vendor/bin/phpstan analyse`
- `docker compose exec frontend pnpm typecheck && pnpm lint`
