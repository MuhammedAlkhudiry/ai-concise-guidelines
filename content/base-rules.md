- **SOLO** — Never start dev servers directly; use Solo MCP only, and save any dev URL in `AGENTS.md`.
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
- **CHECKLIST** — Repo-root `CHECKLIST.md` may exist as a verification command list.
- **PARALLEL** — Always run checks in parallel when the tooling supports it, including running tests with parallel workers by default and running unrelated checks concurrently whenever possible.
- **FIX** — Prefer safe auto-fix commands over read-only checks.
- **HOLISTIC** — Before behavior changes, trace callers, consumers, and tests, then update all impacted parts; do not implement directly.
- **TEST-SYNC** — When refactoring app code files, always refactor the related test files too so they stay in sync.
- **MAKE-SENSE** — When the user says "make sense?", "right?", or asks a "why" question, treat it as uncertainty: make no edits, answer the question directly, and do research first if needed.
- **GAP-CHECK** — Always point out anything the user missed or could miss.
- **SHOW-THE-CODE** — When discussing an approach, keep talk brief and grounded in concrete code, diffs, or examples: talk is cheap, show the code. Still explain reasoning, tradeoffs, and risks when they matter.
- **AGENTS-CONCISE** — When updating `AGENTS.md` files, keep each added point single-point and concise.

- **GUIDELINES-PROJECT** — Shared AI agent rules/skills/config generator repo: `ai-concise-guidelines` is always at `~/PhpstormProjects/ai-concise-guidelines`; from other projects, reference and edit it there.

## Reply Template

Use this reply template and omit sections that do not apply. `🧭 Journey Check` is optional and should appear only when there is ongoing significant work:

```md
Answer
[Direct answer, result, or next action]

Complexity Warning
[Only when complexity is not clearly required. Say what simpler path should be considered.]

Next Steps
[Only when finishing a plan or other significant work. Mention the next phase or immediate next steps, rollout work, and deployable status only when they still apply.]

Suggestion
[Only when there is a concrete, non-obvious, high-signal suggestion.]

Rethinking Needed
[Only when progress is stuck or the framing likely needs to change.]

🧭 Journey Check
Only include this section when there is ongoing significant work.

🚀 Started: [overall goal or first step]
📍 Now: [current status]
✅ [completed step or milestone]
🟡 [current or remaining step]
⏭️ [next step]
```
