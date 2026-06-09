---
name: tooling-operations
description: Poppler PDF operations, local helper command checks, and hosts-file edits through the hosts helper.
---

# Tooling Operations

Use existing project tools instead of recreating their workflows manually.

## Workflow

1. Identify whether the task is PDF work or a helper-command workflow.
2. Use the matching tool directly. To check common local helper tools, run:

```bash
bun "$HOME/.agents/skills/tooling-operations/scripts/tool-doctor.ts"
```

3. Stop only when the required tool is missing or lacks the needed capability.

## PDF Processing

- Use Poppler for any PDF processing.
- If Poppler is not installed, stop and ask the user.
- Prefer Poppler tools such as `pdfinfo`, `pdftotext`, and `pdftoppm` over ad hoc alternatives.

## Project Helper Commands

- Use `hosts` to list, add, or delete hosts entries. Let the command handle backups and cleanup.

## Rules

- Prefer the purpose-built helper over lower-level commands.
- Keep usage aligned with the tool's supported workflow.
- When relevant, suggest tool choices or workflow improvements that would make the task faster, safer, or more repeatable.
