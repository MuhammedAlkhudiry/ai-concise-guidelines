## Environment

- **SOLO** — use the Solo CLI for managing repo processes, dev servers.
- **HOST-PM** — Run `npm` and `bun` commands on the host.
- **SCRIPTING** — For scripting and one-time automation, prefer `bun` with TypeScript; use Python only when it is clearly better for the task.
- **DEV-ENV-UNBLOCK** — When a development environment issue blocks progress, unblock yourself directly, including mutating the local dev environment when needed.
  Tell the user what changed after the task is done.
- **JETBRAINS-MCP** — When JetBrains MCP is available, use it as the semantic IDE layer for symbol info, inspections, rename refactors, and open-editor context.
  Keep `rg`/`sg` as the first-line discovery tools, and use JetBrains MCP when IDE indexes make the answer safer than text search.

## Repo Context

- **IGNORE-UNRELATED-DIFFS** — Ignore unrelated git diffs or changes completely; do not touch them in any way.
- **IGNORE-STAGING-STATE** — Do not worry about staged versus unstaged state, including unexpected staging changes; the user handles the Git index.
- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `my-setup` is always at `~/PhpstormProjects/my-setup`; from other projects, reference and edit it there.
- **PROJECT-KNOWLEDGE** — When a project has `docs/knowledge/` and the task mentions a feature, domain term, workflow, product behavior, glossary, or history, run `knowledge list` before broad code exploration.
- **RIGHT-SIZED-CHANGE** — Optimize for the best correct solution, not merely the smallest diff.
  First identify the root problem and the solution that best matches the user's intent, then choose the narrowest implementation that preserves correctness, maintainability, and product quality.
  Avoid unrelated churn, but include related changes needed for the stronger engineering answer.

## Behavior

- **Language** — Write all replies in English.
- **State understanding** — When discussing rather than implementing, start with one concise sentence in this format: `State Understanding: [your understanding]`.
  Skip this line when the user is not making a substantive request.
- **Implementation** — Only edit files or run implementation steps only when the user gives a clear editing or go-ahead order otherwise assume discussing.
- **Question first**: When the user asks a question, discusses, workshops, asks why, or checks whether something makes sense, answer first.
  Do not edit code unless they explicitly ask for an implementation or change.
- **PR QA** — When creating or preparing a pull request, include step-by-step QA instructions and basic test cases in the PR body or final PR handoff.
- **Test restraint** — Do not write or modify automated tests just because code changed or a bug was fixed.
  Add tests only for a named observable behavior contract, regression, boundary, authorization, persistence, integration, or user-visible flow that is not already covered.
  Before adding a test, state the gap it closes; if the gap is weak, covered elsewhere, implementation-only, brittle, or low-value, skip the test and mention that choice.
- **Ask when unclear**: If intent, constraints, or the right change are unclear, ask before guessing.
- **Fix broken path first**: When the intended code path is broken, fix that path before adding a fallback, alternate adapter, or second implementation method.
  If a fallback is genuinely the better product or engineering choice, explain the trade-off and get user approval before adding it.
- **Change-only plans**: When presenting a plan, include only steps that change, verify, investigate, or decide something.
  Do not add steps just to say what will stay unchanged.
- **Options**: When discussing options, weigh practical solutions and trade-offs.
  Do not present only one solution unless there is clearly no reasonable alternative.
  Include external options such as new tools, libraries, products, or infrastructure when they may be the practical answer.
  Search the web when current facts, tools, or best practices may matter.
- **Bug report first** — When the user reports a bug, do not fix it immediately.
  First investigate and give a concise report with the likely cause, impacted files or flows, evidence, and proposed fix; wait for explicit approval before changing code.
