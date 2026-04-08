---
name: _xcodebuildmcp-cli
description: Use when working on iOS, macOS, Xcode, Simulator, device, coverage, or Swift package tasks through the `xcodebuildmcp` CLI without MCP setup. Trigger on requests to use XcodeBuildMCP from the terminal, run simulator or device workflows, inspect available XcodeBuildMCP tools, or build and test Apple-platform projects with the upstream CLI.
---

# XcodeBuildMCP CLI

Use the local `xcodebuildmcp` binary for Apple-platform workflows.

## Rules

- Stay CLI-only by default.
- Do not run `xcodebuildmcp mcp` and do not add MCP config unless the user explicitly asks for MCP setup.
- Run commands from the target Xcode or Swift package project root.

## Workflow

1. Confirm the binary exists with `which xcodebuildmcp`.
2. If it is missing, install it with `npm install -g xcodebuildmcp@latest`.
3. Discover available workflows with `xcodebuildmcp tools`.
4. Use `xcodebuildmcp <workflow> <tool> --help` before a new or unclear command.
5. Prefer direct workflow commands over custom shell wrappers.
6. Verify the result from command output, produced artifacts, simulator state, logs, or test results.

## Common Commands

```bash
xcodebuildmcp tools
xcodebuildmcp simulator list
xcodebuildmcp simulator build-and-run --help
xcodebuildmcp device list
xcodebuildmcp macos build --help
xcodebuildmcp swift-package test --help
```

## Notes

- `xcodebuildmcp setup` is interactive. Use it only when project defaults are actually needed.
- Use the command help instead of guessing flags.
