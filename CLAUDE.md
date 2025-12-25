# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains opinionated AI guidelines, skills, workflows, and sub-agents designed for Claude Code and Windsurf. The content is installed to user machines via `init.sh`.

## Repository Structure

```
├── guidelines/          # Core instruction files (merged into CLAUDE.md on install)
├── skills/              # Claude Code skills (auto-discovered by conversation context)
│   └── <skill>/SKILL.md # Each skill has frontmatter: name, description
├── workflows/           # Windsurf workflows (single .md files with frontmatter)
├── sub-agents/          # Claude Code sub-agents (auditor, scout)
├── hooks/               # Claude Code hooks (installed globally to ~/.claude/hooks/)
├── statusline/          # Claude Code status line customization
└── init.sh              # Installer script
```

## Key Architecture

**Skills vs Workflows**: Skills (Claude Code) and workflows (Windsurf) contain similar content but different formats. Skills use `SKILL.md` with YAML frontmatter; workflows use `-mode.md` suffix with Windsurf frontmatter.

**Full Feature Flow**: `full-feature` skill orchestrates: Workshop → Plan → Execute (+ Audit) → Reflection. Each phase invokes a dedicated skill. The `auditor` sub-agent runs **once after Execute phase completes**, reviews all changes with full context, and returns APPROVED or REJECTED. Main agent cannot self-approve—task is never done without audit approval.

**Auto-logging Hook**: `hooks/log-changes.sh` is installed globally to `~/.claude/hooks/`. It auto-logs Edit/Write operations to `changes.log` when a project's `.claude/active-audit.txt` is set. The auditor reads this log to understand what changed during execution.

## Documentation Rules

When creating or modifying shell scripts, hooks, or tooling, always update the corresponding README.md in that directory.
