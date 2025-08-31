After finishing tasks apply these rules: 

- Run relevant checking commands, examples: npm run typecheck && npm run lint && npm run format. (Fix only related issues to the task, ignore the rest)
- If the project has i18n translations, check for any untranslated strings.
- Use guard clauses and early returns to handle errors and edge cases upfront, keeping nesting shallow (≤2–3 levels) so normal logic stays clear.
- Review your comments, apply this: [Write comments only to explain complex or non-obvious logic (the why), keep them concise above the code, avoid trivial notes, and never leave unfinished TODOs].
- At the very end: apply this: [If project has tests, run any relevant tests as the final step to make sure nothing broke].
- Since the user can already view diffs and changes through version control or the UI, focus your after-task summary on concise explanations of details that are not otherwise visible.
