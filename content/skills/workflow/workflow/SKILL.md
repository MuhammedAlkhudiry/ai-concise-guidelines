---
name: workflow
description: Slash-command workflow router for rare procedural tasks: `/workflow github-actions`, `/workflow ci`, `/workflow dependency-upgrade`, `/workflow tool-updates`, `/workflow mobile-social-sign-in` for mobile social login/sign-in, `/workflow mobile-dev-ports` for Expo/React Native port alignment, `/workflow qa-test-cases`, and `/workflow codex-thread-management`.
---

# Workflow

Use this skill when the user asks for a named workflow branch with `/workflow ...` or when the request clearly matches one of the branches.

## Branches

- `/workflow github-actions` or `/workflow ci`: read `references/github-actions.md`.
- `/workflow dependency-upgrade`: read `references/dependency-upgrade.md`, then load only the relevant stack refs under `references/dependency-upgrade/`.
- `/workflow tool-updates`, `/workflow tools-update`, `/workflow cli-updates`, or `/workflow system-tools`: read `references/tool-updates.md`.
- `/workflow mobile-social-sign-in` or `/workflow mobile-social-auth`: read `references/mobile-social-sign-in.md`.
- `/workflow mobile-dev-ports`, `/workflow rn-ports`, or `/workflow expo-ports`: read `references/mobile-dev-ports.md`.
- `/workflow qa-test-cases`: read `references/qa-test-cases.md`, then read `references/qa-test-cases/deep-qa-suite.md`.
- `/workflow codex-thread-management`, `/workflow codex-threads`, `/workflow codex threads`, or `/workflow thread-management`: read `references/codex-thread-management.md`.

## Rules

- Load only the branch reference needed for the current request.
- Do not treat this as a generic workflow skill; use it only for listed branches.
- If a request names an unknown branch, say it is not folded here and continue with the closest existing skill or normal reasoning.
