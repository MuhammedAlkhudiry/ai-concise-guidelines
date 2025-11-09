# After-task checklist

- Run checks: `npm run typecheck && npm run lint && npm run format`. Fix only task-related issues.
- If i18n exists, check for untranslated strings.
- Use guard clauses and early returns; keep nesting shallow (≤2–3).
- Comment only the why for non-obvious logic; keep brief; no leftover TODOs.
- If the project has tests, run relevant tests at the end to ensure nothing broke.
- Summary: keep it EXTREMELY concise; focus on details not visible in diffs.
