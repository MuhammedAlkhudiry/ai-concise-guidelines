---
name: workflow
description: Collection of named workflows for procedural tasks that are useful but not broad enough to stay as standalone skills.
---

# Workflow

Use this when the user asks for `/workflow`, names one of the available workflows, or clearly asks for a rare procedural workflow folded here.

## Available Workflows

- `audit-contract`
- `babysit-prs`
- `codebase-maintenance`
- `codex-management`
- `dependency-upgrade`
- `github-actions`
- `google-ads-api`
- `improve-agent-setup`
- `mobile-dev-ports`
- `mobile-in-app-payments`
- `mobile-social-sign-in`
- `mobile-store-release`
- `prod-db-to-local`
- `product-setup`
- `qa-test-cases`
- `super-thread`
- `task-to-pr`
- `tool-updates`

## Rules

- Load only the branch reference needed for the current request.
- Reference files live under `references/<workflow>.md` unless the closest existing filename differs.
- For `dependency-upgrade`, load only the relevant stack refs under `references/dependency-upgrade/`.
- Do not treat this as a generic workflow skill; use it only for listed branches.
- Infer the intended workflow from natural wording when the match is clear.
- If the intended workflow is unclear, ask a short clarifying question before loading a reference.
- If a request names an unknown workflow, say it is not folded here and continue with the closest existing skill or normal reasoning.
