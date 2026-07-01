---
name: hugeicons-cli
description: Hugeicons CLI workflows for icon search, free icon lookup, icon picking, SVG export, framework snippets, usage examples, and local `hugeicons` commands.
---

# Hugeicons CLI

Use local `hugeicons` for icon search, SVG export, and usage snippets.

## Rules

- Stay CLI-first. Do not add Hugeicons MCP config unless the user explicitly asks for MCP.
- Treat the command as free-icon focused unless the user says Pro access is available.
- Verify the exact icon name from command output before wiring it into code.

## Workflow

1. Search with `hugeicons search <query>`.
2. Inspect or copy the raw SVG with `hugeicons svg <icon-name>` or `hugeicons path <icon-name>`.
3. Generate framework snippets with `hugeicons usage <platform> <icon-name>`.
4. Install the matching Hugeicons package only in the target project, not in this guidelines repo.
5. Finish when the exact icon name, SVG/path or framework snippet, and any installed package are verified against the target project.

## Common Commands

```bash
hugeicons search sparkles
hugeicons path ai-search
hugeicons svg ai-search --out ./icon.svg
hugeicons usage react ai-search
hugeicons usage html ai-search
```

## Platforms

Supported platforms: `react`, `react-native`, `vue`, `svelte`, `angular`, `flutter`, `html`.
