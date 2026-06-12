---
name: workflow
description: Slash-command workflow router for rare procedural tasks: `/workflow github-actions`, `/workflow ci`, `/workflow dependency-upgrade`, `/workflow mobile-social-sign-in` for mobile social login/sign-in, `/workflow mobile-dev-ports` for Expo/React Native port alignment, and `/workflow qa-test-cases`.
---

# Workflow

Use this skill when the user asks for a named workflow branch with `/workflow ...` or when the request clearly matches one of the branches.

## Branches

- `/workflow github-actions` or `/workflow ci`: read `references/github-actions.md`.
- `/workflow dependency-upgrade`: read `references/dependency-upgrade.md`, then load only the relevant stack refs under `references/dependency-upgrade/`.
- `/workflow mobile-social-sign-in` or `/workflow mobile-social-auth`: read `references/mobile-social-sign-in.md`.
- `/workflow mobile-dev-ports`, `/workflow rn-ports`, or `/workflow expo-ports`: read `references/mobile-dev-ports.md`.
- `/workflow qa-test-cases`: read `references/qa-test-cases.md`, then read `references/qa-test-cases/deep-qa-suite.md`.

## Rules

- Load only the branch reference needed for the current request.
- Do not treat this as a generic workflow skill; use it only for listed branches.
- If a request names an unknown branch, say it is not folded here and continue with the closest existing skill or normal reasoning.
