---
name: workflow
description: Slash-command workflow router for rare procedural tasks: `/workflow github-actions`, `/workflow ci`, `/workflow dependency-upgrade`, and `/workflow qa-test-cases`.
---

# Workflow

Use this skill when the user asks for a named workflow branch with `/workflow ...` or when the request clearly matches one of the branches.

## Branches

- `/workflow github-actions` or `/workflow ci`: read `references/github-actions.md`.
- `/workflow dependency-upgrade`: read `references/dependency-upgrade.md`, then load only the relevant stack refs under `references/dependency-upgrade/`.
- `/workflow qa-test-cases`: read `references/qa-test-cases.md`, then read `references/qa-test-cases/deep-qa-suite.md`.

## Rules

- Load only the branch reference needed for the current request.
- Do not treat this as a generic workflow skill; use it only for listed branches.
- If a request names an unknown branch, say it is not folded here and continue with the closest existing skill or normal reasoning.
