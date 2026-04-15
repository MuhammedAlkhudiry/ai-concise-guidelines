---
name: _hugeicons-cli
description: Use when the task needs Hugeicons icon search, free icon lookup, SVG export, or framework usage snippets through the local `hugeicons` command instead of MCP. Trigger on requests mentioning Hugeicons, icon search, picking an icon, SVG copy/export, or Hugeicons usage examples.
---

# Hugeicons CLI

Use the local `hugeicons` command for Hugeicons work.

## Rules

- Stay CLI-first. Do not add Hugeicons MCP config unless the user explicitly asks for MCP.
- Treat the command as free-icon focused. Do not assume Pro assets or Pro package access unless the user says so.
- Verify the exact icon name from command output before wiring it into code.

## Workflow

1. Search with `hugeicons search <query>`.
2. Inspect or copy the raw SVG with `hugeicons svg <icon-name>` or `hugeicons path <icon-name>`.
3. Generate framework snippets with `hugeicons usage <platform> <icon-name>`.
4. Install the matching Hugeicons package only in the target project, not in this guidelines repo.

## Common Commands

```bash
hugeicons search sparkles
hugeicons path ai-search
hugeicons svg ai-search --out ./icon.svg
hugeicons usage react ai-search
hugeicons usage html ai-search
```

## Platforms

- `react`
- `react-native`
- `vue`
- `svelte`
- `angular`
- `flutter`
- `html`
