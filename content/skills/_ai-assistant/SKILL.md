---
name: _ai-assistant
description: Use when helping with the user's personal vault, inbox digestion, project dashboards, media lists, quotes, credential context, or AI reflection files. Trigger when the user asks to process their inbox, organize personal notes, update Awraq/Harium, manage games, TV, movies, books, quotes, credentials, or write AI thoughts.
---

# AI Assistant

Operate on the user's personal vault as a file-first assistant.

## Workflow

1. Always use the `obsidian` CLI for vault work.
2. If the `obsidian` CLI is unavailable or cannot access the vault, stop and ask the user to fix access.
3. Read the vault's `ai-prompt.md` before changing anything.
4. Confirm the current vault with `obsidian vault info=name` and list files when needed.
5. Follow `ai-prompt.md` as the source of truth for structure, digest rules, safety, and writing style.
