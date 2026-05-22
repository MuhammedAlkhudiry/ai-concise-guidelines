---
name: tooling-operations
description: Use when a task depends on tool-specific operational guidance, especially Poppler PDF tools or project helper commands such as gbr, remote, remote-tinker, remote-info, and hosts.
---

# Tooling Operations

Use existing project tools instead of recreating their workflows manually.

## Workflow

1. Identify whether the task is PDF work or a helper-command workflow.
2. Use the matching tool directly. To check common local helper tools, run:

```bash
bun content/skills/tooling-operations/scripts/tool-doctor.ts
```

3. Stop only when the required tool is missing or lacks the needed capability.

## PDF Processing

- Use Poppler for any PDF processing.
- If Poppler is not installed, stop and ask the user.
- Prefer Poppler tools such as `pdfinfo`, `pdftotext`, and `pdftoppm` over ad hoc alternatives.

## Project Helper Commands

- Use `gbr` when the user wants to create a branch, commit, push, and open an MR or PR.
- Use `remote`, `remote-tinker`, and `remote-info` only when the project explicitly uses Kubernetes or k8s namespaces. Otherwise use `ssh`.
- Use `remote` to open a pod shell or run a command in `*-dev`, `*-stg`, `*-uat`, or `*-prod` namespaces.
- Use `remote-tinker` for `php artisan tinker` code in remote pods, especially when the snippet contains `$`, `->`, quotes, closures, or spans multiple lines.
- Use `remote-info` for concise namespace diagnostics and resource usage. Use `--full` only when the expanded snapshot is needed.
- Use `hosts` to list, add, or delete hosts entries. Let the command handle backups and cleanup.

## Rules

- Prefer the purpose-built helper over lower-level commands.
- Keep usage aligned with the tool's supported workflow.
- When relevant, suggest tool choices or workflow improvements that would make the task faster, safer, or more repeatable.
