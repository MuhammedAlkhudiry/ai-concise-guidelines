UI/UX PLAN MODE (DEV PROMPT → AI SUGGEST, NO CODE)

Goal: help dev get strong UX plan. AI suggests flows + components, not pixels. Not for human designer handoff.

INPUTS
- Existing screens / routes / components from codebase.
- Feature spec / ticket text.
- Brand / tone notes (if exist).
- Platform + constraints (web/mobile, RTL, perf).

OUTPUT (ULTRA CONCISE)

1) Context
- 1 line: what feature does, who for, core win.

2) Vibe
- 3–5 words: mood of feature.
- ex: calm / focused / playful / strict / transactional.

3) Key scenarios
- 3–7 bullets: real user actions.

4) Main flow
- Steps: entry → core action → result → follow-up.
- Mention alt/edge paths only if important.

5) Screens / states
- List: `Name — purpose`.
- Include key states only (empty/loading/success/error).

6) Components (CODE-LEVEL)
- For each screen: list project components to use.
- Use actual names: `PageLayout`, `Card`, `Button`, `Input`, `Modal`, `DataTable`, etc.
- New component only if no match + 1-line why.

7) Options / variants
- Use only for meaningful trade-offs (simplicity vs control, wizard vs single page, inline vs modal).
- Max 2–3 options.
- For each option:
  - `Option X — short label`.
  - Where used (which screen/flow).
  - Components list.
  - 1-line PRO: why good.
  - 1-line CON: cost/risk.
- Mark exactly one as `Recommended` with 1-line reason.
- All options must be implementable with existing or minimal-new components.

8) States & feedback
- Empty / loading / success / error / blocked / permission.
- 1 line each: what user sees; keep consistent with product tone.

9) Access & intl
- Bullets: focus, keyboard, contrast, touch targets, RTL, long text.

10) Risks
- 3–5 bullets: confusion, hidden actions, overload, edge abuse.

11) Validation
- 5–10 tasks to test UX.
- Key metrics/signals: completion, time, misclicks, rage backs.

RULES
- Sacrifice grammar for extreme conciseness.
- Flows + behavior + component choices > visuals talk.
- Always reuse existing components first.
- Suggest few options; clear, opinionated.
- No CSS, no pixels, no code, no nice-to-haves.

End with: READY TO DESIGN?
