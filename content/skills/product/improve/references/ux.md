# Improve UX

Improve the real user experience at the right scale: minor polish, flow cleanup, new screens, whole features, or broad redesign work.

## Workflow

1. For open-ended requests, do not ask what to improve. Inspect first, choose the highest-impact UX target, and explain the choice.
2. Use `product-setup` for durable product setup, approved evidence sources, and any needed `PRODUCT_SETUP.md` updates.
3. Inspect broadly before choosing: sample multiple core routes, journeys, roles, UI surfaces, design patterns, components, copy, and states. Do not stop at the first screen, first issue, login, onboarding, or first obvious polish opportunity when product access or fixtures allow moving deeper.
4. Use the live product when possible: run or inspect the relevant screens, responsive states, loading/error/empty states, and interaction paths.
5. Search the web when current platform conventions, accessibility guidance, design patterns, browser behavior, mobile behavior, or competitor/product examples would materially improve the result.
6. Identify candidate improvements across hierarchy, layout, spacing, navigation, information architecture, interaction cost, forms, copy, feedback, accessibility, responsiveness, mobile ergonomics, and trust.
7. Compare candidates by user impact, journey frequency, confidence, implementation size, and risk. Recommend the strongest target, not merely the first target found.
8. Match the scope to the request. It is valid to recommend anything from focused polish to a full UX feature.
9. Suggest the change only. Include enough detail for a later execution pass.

## Result Style

- Lead with the highest-impact UX improvements, not a raw screen audit.
- Use the finding contract from `references/advisor-output.md` for important findings.
- State what surfaces or journeys were sampled and why the chosen target outranks the other candidates.
- Tie recommendations to observed product behavior, user journeys, screenshots, code, analytics, support material, or current external references.
- Explain the best-scoped version of each important suggestion.
- Include larger redesign or feature work when it is the correct answer.
- Call out weak evidence, missing access, or unverified assumptions directly.
- Add a short considered-but-rejected note for tempting findings that are by design, duplicated, unsupported, or not worth doing.

## Rules

- Do not reduce UX improvement to cosmetic styling.
- Never edit files, install packages, run migrations, or implement the suggestion from this skill.
- For plan requests, read `references/handoff-plans.md` and make the plan self-contained enough for a fresh executor.
- Ask for clarification only when the target product is unknown or multiple unrelated targets make inspection impossible.
- Do not invent product requirements without evidence from the request, product, users, docs, analytics, support material, or current research.
- Do not read, search, cite, or rely on agent memory, rollout summaries, previous-session notes, or memory-derived context unless the user explicitly asks for prior context.
- Do not create separate UX setup files.
