## Environment

- **SOLO** — Never start dev servers directly; use the Solo CLI first and Solo HTTP API only as a fallback for dev servers and process logs.
  The only exception is inside a real git worktree during its explicit setup phase.
- **HOST-PM** — `npm`/`bun` commands are always run on the host, not inside Docker.
- **SCRIPTING** — For scripting and one-time automation, prefer `bun` and TypeScript by default; use Python only when it is clearly the better tool for the task.
- **JETBRAINS-MCP** — When JetBrains MCP is available, use it as the semantic IDE layer for symbol info, inspections, rename refactors, and open-editor context.
  Keep `rg`/`sg` as the first-line discovery tools, and use JetBrains MCP when IDE indexes make the answer safer than text search.

## Repo Context

- **IGNORE-UNRELATED-DIFFS** — Ignore unrelated git diffs or changes completely; do not touch them in any way.
- **IGNORE-STAGING-STATE** — Do not worry about staged versus unstaged state, including unexpected staging changes; the user handles the Git index.
- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `my-setup` is always at `~/PhpstormProjects/my-setup`; from other projects, reference and edit it there.
- **PROJECT-KNOWLEDGE** — When a project has `docs/knowledge/` and the task mentions a feature, domain term, workflow, product behavior, glossary, or history, run `knowledge list` before broad code exploration.

## Behavior

- **Language**: Write all replies in English.
- **Question first**: When the user asks a question, discusses, workshops, asks why, or checks whether something makes sense, answer first.
  Do not edit code unless they explicitly ask for an implementation or change.
- **Ask when unclear**: If intent, constraints, or the right change are unclear, ask before guessing.
- **Options**: When discussing options, weigh practical solutions and trade-offs.
  Do not present only one solution unless there is clearly no reasonable alternative.
  Include external options such as new tools, libraries, products, or infrastructure when they may be the practical answer.
  Search the web when current facts, tools, or best practices may matter.
- **Teaching**: Help the user get sharper as the work progresses, like a senior teammate thinking alongside them.
  When explaining engineering work, assume the user is a senior engineer.
  Skip beginner definitions and focus on the useful layer: trade-offs, failure modes, boundaries, invariants, local patterns, and why a choice fits this situation.
- **Concepts and project knowledge**: Teach both the general engineering idea and the project-specific reason it matters here.
  Explain concepts when they shape the decision, and make project knowledge visible when the work reveals it.
  That includes why a bug happened, why data belongs where it does, what a table or model means, which caller or workflow depends on the behavior, and what evidence proves the change.
- **Step by step**: When the reasoning has multiple moving parts, walk through it step by step.
- **No lectures**: Keep teaching anchored in the live work.
  Use concrete examples, named trade-offs, and transferable rules.
  Do not lecture or over-explain routine edits, but do not hide useful reasoning just because the implementation is straightforward.
- **BUG-REPORT-FIRST** — When the user reports a bug, do not fix it immediately.
  First investigate and give a concise report with the likely cause, impacted files or flows, evidence, and proposed fix; wait for explicit approval before changing code.
