# AGENTS.md Best Practices

Condensed from agentsmd.io, GitHub (2,500+ repo analysis), OpenAI Codex docs, Claude Code, and OpenCode.

## Core Principles

- **Specific > vague** — "You are a helpful assistant" fails. "You are a test engineer who writes tests for React components, follows these examples, and never modifies source" works.
- **Code examples > explanations** — One real snippet showing your style beats three paragraphs.
- **Commands early** — Put executable commands in an early section. Agents reference them often.
- **Six areas** — Commands, testing, project structure, code style, git workflow, boundaries.

## Dos and Don'ts

Be nitpicky. Include exact versions and library preferences:

```markdown
### Do
- use MUI v3, emotion `css={{}}` prop format
- use design tokens from `DynamicStyles.tsx`, no hardcoding
- default to small components, focused modules over god components
- default to small files and diffs, avoid repo-wide rewrites unless asked

### Don't
- do not hardcode colors
- do not add heavy dependencies without approval
```

## File-Scoped Commands

Prefer single-file validation over full builds. Large codebases make full builds slow; agents run them too often.

```markdown
### Commands
# Type-check single file
npm run tsc --noEmit path/to/file.tsx

# Format single file
npm run prettier --write path/to/file.tsx

# Lint single file
npm run eslint --fix path/to/file.tsx

# Unit test single file
npm run vitest run path/to/file.test.tsx

# Full build only when explicitly requested
yarn build
```

## Safety and Permissions

Three tiers:

```markdown
### Safety and Permissions
**Allowed without prompt:**
- read files, list files
- tsc/prettier/eslint on single file
- vitest single test

**Ask first:**
- package installs, git push
- deleting files, chmod
- full build, e2e suites

**Never:**
- commit secrets (most common helpful constraint)
- edit vendor/, node_modules/
- modify production configs
```

## Project Structure Hints

Point agents to key locations. Reduces exploration time.

```markdown
### Project Structure
- see `App.tsx` for routes
- see `AppSideBar.tsx` for sidebar
- components live in `app/components`
- design tokens in `app/lib/theme/tokens.ts`
```

## Good and Bad Examples

Point to real files. Call out legacy code to avoid.

```markdown
### Examples
- avoid: `Admin.tsx` (class-based, legacy)
- prefer: `Projects.tsx` (functional, hooks)
- forms: copy `app/components/DashForm.tsx`
- charts: copy `app/components/Charts/Bar.tsx`
- data layer: use `app/api/client.ts`, do not fetch in components
```

## Hierarchical Discovery (Codex)

1. **Global**: `~/.codex/AGENTS.md` or `~/.codex/AGENTS.override.md`
2. **Project**: Walk from Git root to cwd, check `AGENTS.override.md` then `AGENTS.md` per directory
3. Later files override earlier. Default size limit 32 KiB (`project_doc_max_bytes`).

## When Stuck

Give agents an escape hatch:

```markdown
### When Stuck
- ask a clarifying question, propose a short plan, or open draft PR with notes
- do not push large speculative changes without confirmation
```

## Common Pitfalls

- **Too vague** — "Write clean code" < "Use functional components with hooks"
- **Conflicting rules** — Ensure sections don't contradict each other
- **Over-engineering** — Start minimal, expand when agents make mistakes
- **Stagnation** — Update as project evolves
