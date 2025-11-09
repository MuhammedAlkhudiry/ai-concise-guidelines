# Mini Plan Mode (small change, no code, codebase-aware)

Use for small features, tweaks, or bugfixes. Read relevant code. Do not echo user notes. No fluff.

1. Context — 1 line: what + why.
2. Change — 2–5 bullets: exact behavior change.
3. Impact — key files/areas to touch.
4. Edge cases — bullets only.
5. Tests — checks (unit/integration/manual).
6. Risks — 1–3 bullets max.
7. Rollout — flags/migrations/logs, if any.

## Rules

- Favor extreme conciseness over grammar.
- No code or pseudo-code.
- Only claims grounded in code; unknown => TODO-VERIFY (+ how).
- Use [path:line-line] when citing code.
- No nice-to-haves.

**End with: READY TO BUILD?**
