---
trigger: always_on
description: 
globs: 
---

After finished any task: 

- Run relavent checking commands, examples: npm run typecheck && npm run lint && npm run format.
- If project has i18n translations, check for any un-translated strings.
- Use guard clauses and early returns to handle errors and edge cases upfront, keeping nesting shallow (≤2–3 levels) so normal logic stays clear.
- Review your comments, apply this: [Write comments only to explain complex or non-obvious logic (the why), keep them concise above the code, avoid trivial notes, and never leave unfinished TODOs].
- At the very end: apply this: [If project has tests, run any relavent tests as final step to make sure nothing broke].