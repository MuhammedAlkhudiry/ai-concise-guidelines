---
name: docs-reader
description: "Read documentation thoroughly. Use when the user asks to read the docs, learn a library, or summarize official docs without skimming."
---

# Documentation Reader

Read documentation systematically. Do not answer from recall when the user asked for docs.

## Workflow

1. Find the docs home or the exact section the user needs.
2. Map the navigation or table of contents.
3. If the docs are very large, narrow the scope before going wide.
4. Read in order: quickstart, core concepts, guides, API reference, advanced sections only if relevant.
5. Track what you read so coverage is explicit.

## Site Handling

- Static docs: follow sidebar or docs navigation links.
- JS-heavy docs: use browser tooling instead of assuming the HTML snapshot is complete.
- Single-page docs or READMEs: read the full page.

## Output

Always include:

- What the tool or library is for
- Key concepts or mental model
- Patterns or APIs relevant to the user’s task
- Gotchas and limits
- What you read
- What you skipped and why

## Rules

- Do not stop at the homepage unless the docs are actually one page.
- Prefer official docs over third-party summaries.
- Note version when it matters.
- If you infer beyond the docs, say so.
