---
name: tool-updates
description: External CLI tool update.
---

## Workflow

1. Run `my-setup tools status`, then `my-setup tools update-plan`. Treat their live output as the inventory, ownership, status, and supported-update authority.
2. Run only eligible update commands from the plan. After a runtime-manager or Node upgrade, re-check its global CLIs and repair missing commands from their documented package source.
3. Re-run `my-setup tools status` until every eligible item is current or has an exact blocker.
4. For each updated tool, read the official release notes or changelog for every version crossed. Do not infer changes when official notes are unavailable.

## Report

- Lead with each updated tool as `<tool>: <old version> → <new version>`.
- Under each tool, summarize notable new capabilities, behavior or configuration changes, breaking changes, and meaningful bug or security fixes across the versions crossed.
- Then report runtime-linked repairs, blockers or warnings, and one compact verification result.
- Omit unchanged or ineligible tools, routine maintenance, and unsupported claims. State when official notes are unavailable or when no updates were needed.
