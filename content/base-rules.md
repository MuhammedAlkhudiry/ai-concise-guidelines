- **SOLO** — Never start dev servers directly; use Solo MCP only, except in a real git worktree where full project setup, direct dev-server runs, and saving any dev URL in `AGENTS.md` are allowed.
- **NO-BUILD** — Never run `build` or build frontend assets. For QA testing, assume dev servers should already be running; if they are not, start them using the allowed project flow or ask the user.
- **HOST-PM** — `npm`/`bun` commands are almost always run on the host, not inside Docker.
- **SCRIPTING** — For scripting and one-time automation, prefer `bun` and TypeScript by default; use Python only when it is clearly the best tool for the specific task.
- **CONSISTENCY** — Reuse existing patterns, files, and functions first; avoid new patterns unless approved.
- **SIMPLE** — Simple is absolute in everything: logic, tools, code, structure, and workflow. Fight ruthlessly against creeping or sneaky complexity and keep solutions as simple as they can be.
- **COMPATIBILITY** — Prefer the correct change over backward compatibility or artificially small fixes. Keep backward compatibility only for deployed, production, inter-system contracts. If a feature is not deployed, the system is not production, or the change is within one system, make a clean-cut change. For bugs, prefer the smallest correct fix first.
- **BC-ESCALATION** — If I keep backward compatibility and it adds complexity, I must explicitly call that out and ask whether a clean-cut change would be acceptable.
- **COMMENTS** — Keep comments tied to current code only; remove stale or removed comments.
- **STRUCTURE** — Confirm the data model before touching data; never assume schema details.
- **QUERY** — Build query strings only with framework/library helpers; never concatenate manually.
- **LANGUAGE** — Write all replies in English unless the user explicitly asks for another language.
- **TRANSLATION** — Translate all user-facing copy naturally and contextually; add missing translations when needed.
- **QUALITY** — Run type-check, lint, format, and relevant tests; fix only task-related issues before finishing.
- **TEST-THRESHOLD** — Do not require new or updated tests for simple non-behavioral changes; keep tests for behavior changes, bug fixes, and new features.
- **CHECKLIST** — Repo-root `CHECKLIST.md` may exist as a verification command list.
- **PARALLEL** — Always run checks in parallel when the tooling supports it, including running tests with parallel workers by default and running unrelated checks concurrently whenever possible.
- **FIX** — Prefer safe auto-fix commands over read-only checks.
- **HOLISTIC** — Before behavior changes, trace callers, consumers, and tests, then update all impacted parts; do not implement directly.
- **TEST-SYNC** — When refactoring app code files, always refactor the related test files too so they stay in sync.
- **MAKE-SENSE** — When the user says "make sense?", "right?", or asks a "why" question, treat it as uncertainty: make no edits, answer the question directly, and do research first if needed.
- **DEPLOY-CHECK** — When the user asks "good to deploy?" or equivalent, treat it as a high-scrutiny release-readiness review: think deeply, verify relevant checks and rollout risks, look for anything missed, and do not approve unless it is genuinely ready.
- **GAP-CHECK** — Always point out anything the user missed or could miss.
- **IGNORE-UNRELATED-DIFFS** — If I find unrelated git diffs or changes, ignore them completely and do not touch them in any way.
- **SHOW-THE-CODE** — Prefer code, diffs, and concrete examples over English explanation whenever possible. Keep talk brief, show the code, and explain reasoning, tradeoffs, or risks only when they matter.
- **CODEX-CARDLESS** — For Codex UI work, default to cardless UI unless the existing product pattern or task clearly requires cards.
- **AGENTS-CONCISE** — When updating `AGENTS.md` files, keep each added point single-point and concise.

- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `ai-concise-guidelines` is always at `~/PhpstormProjects/ai-concise-guidelines`; from other projects, reference and edit it there.

## Reply Template

Use this reply template and omit sections that do not apply. Do not repeat the same point across sections; once something is covered in `Answer`, only mention it again elsewhere if adding new information.

```md
Answer
[Direct answer, result, or next action]

Complexity Warning
[Only when the code shows unnecessary complexity. Say what is overcomplicated and what simpler path should replace it. Do not use this section for planning or discussion.]

Next Steps
[Only when finishing a plan or other significant work. Mention the next phase or immediate next steps, rollout work, and deployable status only when they still apply.]

Suggestion
[Only when there is a high-signal UX/DX suggestion, tool suggestion, workflow improvement, or practical protip that is adjacent to the task but not part of the required work. Do not use this section for obvious implementation steps, expected best practices, or anything directly needed to complete the task.]

Dead Code Alert
[Only when there is dead code, unreachable code, or misleading structure worth calling out.]

Logic Alert
[Only when there is a logic risk, hidden bug, or incorrect behavior worth calling out.]

Rethinking Needed
[Only when progress is stuck or the framing likely needs to change.]
```
