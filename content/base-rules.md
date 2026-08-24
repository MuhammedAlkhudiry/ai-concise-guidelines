## Environment

- **TOOLING** — Use the `lanes` CLI for persistent lane services and project-owned commands for other development servers. Run `npm` and `bun` on the
  host. For scripts and one-time automation, prefer Bun with TypeScript; use Python only when it is clearly better suited. Keep disposable and
  one-time production data-fix scripts outside Git repositories. Commit only reusable scripts intended for recurring use.
- **LANES-RUNTIME** — The harness owns task worktree creation and deletion. At task start inside a managed worktree, use $project-lanes to provision
  or repair its lane before project work; a missing lane is setup work, not a reason to reduce scope. Destroy the lane before worktree deletion.
  `lanes` owns only isolated runtime resources and must never perform Git or worktree operations.
- **TEMP-ARTIFACTS** — Store all disposable artifacts—including temporary screenshots, captures, exports, intermediate files, and anything intended
  for deletion—in a fresh directory under the macOS temporary directory, never inside a Git repository. Write an artifact into a repository only when
  it is an intentional, durable project file.
- **DEV-ENV-UNBLOCK** — When a development environment issue blocks progress, unblock yourself directly, including local development environment
  changes. Report what changed after the task.

## Repo Context

- **GIT-SCOPE** — Ignore unrelated changes and staging state. Do not modify unrelated diffs; the user manages the Git index.
- **TRACK-CREATED-FILES** — Before completing a task, add every intentional file created during the task to Git so it is tracked. Do not stage
  unrelated files or pre-existing modifications.
- **GUIDELINES-PROJECT** — The shared AI rules, skills, and configuration repository is always at `~/PhpstormProjects/my-setup`; reference and edit it
  there from other projects.
- **PERSONAL-KNOWLEDGE** — The source of truth for the owner's life, work, tools, preferences, decisions, and AI-agent context is always at
  `~/PhpstormProjects/personal-knowledge`; reference and edit it there from other projects.

### Active Projects

{{ACTIVE_PROJECTS}}

- **PROJECT-KNOWLEDGE** — When a project has `docs/knowledge/` and a task depends on project-specific language, promised product behavior, rationale,
  or history, run a narrow `knowledge find "<query>"` before broad code exploration and use its canonical glossary terms naturally. Read the complete
  glossary only when editing language or when the query is insufficient. Treat code and runtime evidence as authority for current behavior and active
  product contracts as authority for intended behavior; report conflicts and preserve the intended capability unless the user explicitly supersedes
  the contract. Knowledge packs contain product contracts, boundaries, and scarce rationale; they do not contain language sections, source-file
  inventories, or evidence sections.
- **DOCUMENTATION-ROUTING** — Use Markdown to point to authoritative code, live help, schemas, metadata, or evidence. Do not restate discoverable
  inventories, syntax, options, behavior, or implementation. Keep only durable decisions, boundaries, non-obvious guidance, and completion contracts.

## Behavior

- **QUESTION-FIRST** — When the user asks a question, discusses, explores, workshops, reviews an idea, asks why, or checks whether something makes
  sense, answer and stop. Do not mutate local state unless the user explicitly authorizes the change.
- **GROUND-IN-CODE** — Before answering a project question or changing code, read the relevant code and let the actual system shape the response.
- **LEAVE-ENVIRONMENT-RUNNING** — Assume the user will QA completed work; leave the development environment running unless asked otherwise.
- **SIMULATOR-ON-REQUEST** — Do not launch or interact with a simulator unless the user explicitly asks.
- **MONITOR-IN-PLACE** — When asked to monitor, wait, or watch a task, keep the current task alive. Do not create an automation, reminder, or
  background process unless explicitly requested.
- **PR-MONITORING** — Never monitor or watch a pull request unless the user explicitly asks.
- **WEBSITE-TERMS-AUTHORIZATION** — During browser or computer-use work, you have full authorization and permission to accept the terms, conditions,
  and policies presented by any website within the assigned task. Accept them without stopping for confirmation.
- **TEST-RESTRAINT** — Do not add or modify tests merely because code changed. Add tests only for an uncovered observable contract, regression,
  boundary, authorization, persistence, integration, or user-visible flow. State the gap first; skip brittle, implementation-only, or low-value
  coverage.
- **FIX-BROKEN-PATH-FIRST** — Repair the intended path before adding a fallback or alternate implementation; get approval before introducing one.
- **TRUST-CONTRACTS** — Validate untrusted boundaries, then trust typed inputs, framework guarantees, and established internal contracts. Add
  defensive branches only with evidence; fix missing required values upstream or fail clearly.
- **BUG-REPORT-FIRST** — Investigate reported bugs before changing code. Fix a confirmed issue directly when it changes fewer than five lines or
  repairs infrastructure. Otherwise report the cause, affected files or flows, evidence, and proposed fix, then wait for approval.
