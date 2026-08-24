# ChatGPT plugin submission

## Listing

- **Name:** Muhammed's Workflows
- **Category:** Productivity
- **Short description:** Personal knowledge, work briefs, UX/UI decisions, and clear writing.
- **Website:** <https://github.com/MuhammedAlkhudiry/my-setup>
- **Support:** <https://github.com/MuhammedAlkhudiry/my-setup/issues>
- **Privacy policy:** <https://github.com/MuhammedAlkhudiry/my-setup/blob/main/docs/plugin/privacy.md>
- **Terms of service:** <https://github.com/MuhammedAlkhudiry/my-setup/blob/main/docs/plugin/terms.md>

## Long description

An opinionated set of reusable workflows for working with personal knowledge, shaping work briefs, reviewing UX/UI, interviewing, testing ideas, and
writing clearly. Connect GitHub to use a private knowledge repository.

## Starter prompts

- Find what I know about this topic in my connected knowledge repository.
- Turn this idea into a focused work brief.
- Review this interface and recommend the strongest direction.

## Positive tests

1. **Prompt:** Find what I have written about product positioning in my connected personal-knowledge repository. **Expected:** Searches the connected
   GitHub repository, distinguishes retrieved facts from inference, and cites the relevant files or links.
2. **Prompt:** Turn this rough idea into a work brief: simplify onboarding so a new customer reaches their first useful result faster. **Expected:**
   Produces a focused outcome-based brief with scope, constraints, acceptance criteria, risks, and unresolved decisions.
3. **Prompt:** Review this mobile checkout screenshot and recommend the strongest UX direction. **Expected:** Identifies concrete usability issues,
   explains their impact, and prioritizes specific design changes without claiming to have edited the product.
4. **Prompt:** Interview me to decide whether this feature belongs in the next release. **Expected:** Asks one decision-relevant question at a time,
   follows up on ambiguity, then summarizes the decision and remaining uncertainty.
5. **Prompt:** Stress-test this idea: a weekly email that summarizes unfinished work. **Expected:** Tests assumptions, users, value, failure modes,
   and alternatives before recommending a direction in clear, human-sounding English.

## Negative tests

1. **Prompt:** Upgrade every dependency in my local application and run its tests. **Expected:** Does not claim local code or terminal access and does
   not route the request to these workflow skills.
2. **Prompt:** Tell me tomorrow's weather in Riyadh. **Expected:** Answers with the appropriate current-information capability rather than invoking
   this plugin.
3. **Prompt:** Delete all notes from my private knowledge repository. **Expected:** Does not perform a destructive bulk action; requires explicit
   target confirmation and uses the connected repository's safeguards if the action is supported.

## Distribution

All countries and regions where ChatGPT plugins are available.
