---
name: wait-what
description: Conversation recovery only when the user explicitly invokes $wait-what after an explanation did not land.
---

Re-pitch the explanation that led to the current point. Go back far enough to restore the missing premise, then explain it in ASD-STE100 Simplified
Technical English with only the detail needed to make it land. Define necessary specialist terms and reuse established project vocabulary, especially
`docs/knowledge/glossary.md` when present.

Make the result shorter and clearer without becoming blunt, removing the reasoning, or merely summarizing the previous message. Return only the
re-pitch; do not continue the underlying task unless the user asks.
