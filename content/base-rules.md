## Environment

- **TOOLING** — Use the `lanes` CLI for persistent lane services and project-owned commands for
  other development servers. Run `npm` and `bun` on the host. For scripts and one-time automation,
  prefer Bun with TypeScript; use Python only when it is clearly better suited.
- **DEV-ENV-UNBLOCK** — When a development environment issue blocks progress, unblock yourself
  directly, including local development environment changes. Report what changed after the task.

## Repo Context

- **GIT-SCOPE** — Ignore unrelated changes and staging state. Do not modify unrelated diffs; the user
  manages the Git index.
- **GUIDELINES-PROJECT** — The shared AI rules, skills, and configuration repository is always at
  `~/PhpstormProjects/my-setup`; reference and edit it there from other projects.
- **PERSONAL-KNOWLEDGE** — The source of truth for the owner's life, work, tools, preferences,
  decisions, and AI-agent context is always at `~/PhpstormProjects/personal-knowledge`; reference and
  edit it there from other projects.
- **PROJECT-KNOWLEDGE** — When a project has `docs/knowledge/` and the task mentions a feature,
  domain term, workflow, product behavior, glossary, or history, run `knowledge list` before broad
  code exploration. Before discussing a feature, read `docs/knowledge/glossary.md` and use its
  established domain language. In user-facing prose, bold and italicize every defined term while
  preserving its canonical wording—for example: “We need to allow the [***User***] to...”

## Response

- **LANGUAGE** — Write all replies in English.
- **VERIFICATION-STATUS-COLORS** — Prefix verification results with `🟢` for passed, `🟡` for
  warnings, caveats, or not run, and `🔴` for failed.
- **IMPLEMENTED-RESULT-LABELS** — In final implementation handoffs, prefix each completed outcome
  with one best-fit semantic label: `[✨ **FEAT**]`, `[🐛 **FIX**]`, `[♻️ **REFACTOR**]`,
  `[⚡ **PERF**]`, `[🔒 **SECURITY**]`, `[🧪 **TEST**]`, `[📝 **DOCS**]`, or
  `[🔧 **TOOLING**]`. Reserve traffic-light emojis for verification results and the final status.
- **CLICKABLE-URLS** — Render every known URL as a Markdown link to the exact page, never as plain
  text, inline code, or quoted text.
- **PR-QA** — When creating or preparing a pull request, include step-by-step QA instructions and
  basic test cases in the PR body or final handoff.
- **MANUAL-QA** — When the user asks for QA, provide manual steps, human-run test cases, or a QA
  handoff. Do not run or propose automated end-to-end or smoke tests unless explicitly requested.
- **FINAL-STATUS-SIGNAL** — End every final response with a standalone bold status line. Use
  `🟢 **ALL GOOD**` when complete, `🟡 **ATTENTION NEEDED**` for caveats,
  `🔴 **ACTION REQUIRED**` when the user must act, or `⛔ **BLOCKED**` when progress cannot continue.

## Behavior

- **QUESTION-FIRST** — When the user asks a question, discusses, explores, workshops, reviews an
  idea, asks why, or checks whether something makes sense, answer and stop. Do not mutate local state
  unless the user explicitly authorizes the change.
- **GROUND-IN-CODE** — Before answering a project question or changing code, read the relevant code
  and let the actual system shape the response.
- **LEAVE-ENVIRONMENT-RUNNING** — Assume the user will QA completed work; leave the development
  environment running unless asked otherwise.
- **MONITOR-IN-PLACE** — When asked to monitor, wait, or watch a task, keep the current task alive.
  Do not create an automation, reminder, or background process unless explicitly requested.
- **TEST-RESTRAINT** — Do not add or modify tests merely because code changed. Add tests only for an
  uncovered observable contract, regression, boundary, authorization, persistence, integration, or
  user-visible flow. State the gap first; skip brittle, implementation-only, or low-value coverage.
- **FIX-BROKEN-PATH-FIRST** — Repair the intended path before adding a fallback or alternate
  implementation; get approval before introducing one.
- **TRUST-CONTRACTS** — Validate untrusted boundaries, then trust typed inputs, framework guarantees,
  and established internal contracts. Add defensive branches only with evidence; fix missing required
  values upstream or fail clearly.
- **BUG-REPORT-FIRST** — Investigate reported bugs before changing code. Fix a confirmed issue
  directly when it changes fewer than five lines or repairs infrastructure. Otherwise report the cause,
  affected files or flows, evidence, and proposed fix, then wait for approval.
