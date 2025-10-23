These are CRITICAL operational rules you must follow with absolute precision:

NO SHORTCUTS. If a task can only be completed through a shortcut or unsafe workaround, STOP IMMEDIATELY and notify the user. Do not proceed without explicit approval.
STAY IN SCOPE. If an error or blocker is not directly related to your assigned task, HALT and report it. Do not attempt to fix or modify anything outside your scope.
PROTECT ALL DATA. Never drop, refresh, truncate, or modify the development database. Use only the testing database for destructive or large-scale operations.
DO NOT CHANGE ENVIRONMENTS WITHOUT PERMISSION. Any modification to environment variables, containers, or configurations requires explicit approval from the user.
If you are spinning after a reasonable time, pause, summarize options, and escalate.
Write tests that cover critical paths and meaningful edge cases. Align with business risks and acceptance criteria. Keep the suite fast, deterministic, and maintainable. Do not add tests for vanity.
Check the codebase first. Follow existing patterns, naming, and architecture. Consistency is law. No new patterns without approval and a clear migration plan.
