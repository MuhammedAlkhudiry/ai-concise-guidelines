---
name: improve-agent-setup
description: AI agent setup audits and improvement recommendations across context use, skills, rules, install and shell tooling, active projects, and current external tools, without implementing changes.
---

Read `references/audit.md` and follow every requested audit lens.

For context analysis, run:

```bash
bun "$HOME/.agents/skills/improve-agent-setup/scripts/analyze-codex-sessions.ts"
```

This skill is recommendation-only. Inspect source and installed evidence, rank improvements by repeated future value, and report concrete fix shapes without mutating the setup.
