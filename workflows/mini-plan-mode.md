MINI PLAN MODE (SMALL CHANGE, NO CODE, CODEBASE-AWARE)

Use for small feature, tweak, bugfix. You read relevant code. You do not echo user notes. No fluff.

1) Context — 1 line: what + why.
2) Change — 2–5 bullets: exact behavior diff.
3) Impact — list key files/areas to touch.
4) Edge cases — bullets only.
5) Tests — list checks (unit/integration/manual).
6) Risks — 1–3 bullets max.
7) Rollout — note flags/migrations/logs if any.

RULES
- Sacrifice grammar for extreme conciseness.
- No code. No pseudo-code.
- Only claims from code; unknown => TODO-VERIFY (+ how).
- Use [path:line-line] when referencing code.
- No “nice-to-haves”.

End with: READY TO BUILD?
