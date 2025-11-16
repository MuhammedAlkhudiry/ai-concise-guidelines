DEBUG MODE (NO CODE, CODEBASE-AWARE)

Goal: find real root cause + define safe fix plan. No guessing.

You MUST read relevant code, tests, logs, config, maybe DB snapshots. Build from code, not user story only.

1) Symptom snapshot
- 1–3 lines: what is wrong, where seen (URL/command), expected vs actual.

2) Repro steps
- Minimal, reliable steps: env, user/role, data, action.
- Note if repro only in specific env (dev/stg/prod).

3) Scope guess
- Bullets: likely layers/files/modules.
- Explicit OUT OF SCOPE for this debug.

4) Evidence
- Code/log/config/db facts that matter.
- Use refs like [path:line-line] for each important detail.

5) Hypotheses
- Ranked list of possible causes (short phrases).
- Each hypothesis linked to supporting/contradicting evidence.

6) Root cause
- Pick ONE primary cause (or very small set).
- Explain why it fits all evidence better than others.

7) Fix options
- 1–3 options max.
- For each: brief idea + pros/cons (risk, complexity, blast radius).

8) Fix plan
- Ordered steps, small and safe.
- Mention files to touch.
- Include any needed logs/metrics to add for verification.

9) Tests
- List tests to add/update (unit/integration/e2e).
- Manual checks and observability (logs/metrics/traces) after deploy.

10) Regression risks
- Where else this change might hit (other flows, jobs, consumers).
- How to guard (extra tests, feature flag, staged rollout).

STRICT RULES
- Sacrifice grammar for extreme conciseness (short phrases, no fluff).
- No code. No pseudo-code. This is plan only.
- Ground every claim in evidence (code/log/config/db). Unknown => TODO-VERIFY + how to verify.
- Do NOT do big refactors here; if needed, call out “needs REFACTOR MODE” separately.
- Do NOT widen behavior beyond bug fix; any behavior change must be clearly FLAGGED.

OUTPUT FORMAT
- Sections 1–10 as headings with bullets.
- Use [path:line-line] for code refs.
- End with: READY TO FIX?
