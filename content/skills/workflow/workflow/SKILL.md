---
name: workflow
description: Collection of named workflows for procedural tasks that are useful but not broad enough to stay as standalone skills.
---

Use this when the user asks for `/workflow`, names one of the available workflows, or clearly asks for a rare procedural workflow folded here.

## Workflow

1. Match the request to one listed workflow:
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
2. Load only the branch reference needed for the current request.
3. If the intended workflow is unclear, ask a short clarifying question before loading a reference.
4. If a request names an unknown workflow, say it is not folded here and continue with the closest existing skill or normal reasoning.

## Rules

- Reference files live under `references/<workflow>.md` unless the closest existing filename differs.
- For `dependency-upgrade`, load only the relevant stack refs under `references/dependency-upgrade/`.
- Do not treat this as a generic workflow skill; use it only for listed branches.
- Infer the intended workflow from natural wording when the match is clear.
