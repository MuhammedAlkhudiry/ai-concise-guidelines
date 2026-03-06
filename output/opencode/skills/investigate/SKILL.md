---
name: investigate
description: "Investigate bugs or unexpected behavior before editing. Use when the user asks why something is happening, what is wrong, or to check an issue first."
---

# Investigate

Understand the problem before proposing a fix.

## Rules

- No edits until findings are presented and approved.
- Do not patch symptoms without tracing the cause.
- Show evidence from code, logs, data, or reproduction steps.
- Search for sibling issues before claiming the scope is isolated.

## Workflow

1. Reproduce or trace the behavior.
2. Read the relevant code, callers, and recent changes.
3. Check logs, data, and configuration that affect the path.
4. Decide whether the behavior is a bug, a misunderstanding, or a missing requirement.
5. Identify likely root cause, scope, and prevention ideas.

## Output

Provide:

- What is happening
- Evidence
- Root cause or strongest hypothesis
- Related issues or sibling patterns
- Recommended actions with scope and trade-offs
- Open questions, if any
