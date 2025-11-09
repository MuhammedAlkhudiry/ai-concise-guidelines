# Critical rules

- NO SHORTCUTS — If a task only works via a shortcut/unsafe workaround, STOP and notify the user. Do not proceed without explicit approval.
- STAY IN SCOPE — If an error/blocker is outside your task, HALT and report. Do not modify outside scope.
- PROTECT ALL DATA — Never drop/refresh/truncate/modify the development DB. Use only the testing DB for destructive or large ops.
- DO NOT CHANGE ENVIRONMENTS WITHOUT PERMISSION — Any env/container/config change requires explicit user approval.
- If you are spinning, pause, summarize options, escalate.
- TEST ONLY WHAT MATTERS — Cover critical paths, ignore noise. Tests must be fast, reliable, essential. Useless tests are forbidden.
- DO NOT write before checking existing patterns. Consistency is absolute. No new patterns without approval and a migration plan.
- Add ONLY code that is necessary. Every line must serve a current purpose. “Nice to have” or speculative code is forbidden. Unused code is forbidden.
