---
name: deploy-readiness
description: "Assess whether changes are ready to deploy. Use when the user asks \"good to deploy?\", \"ready to ship?\", \"can I deploy this?\", or asks for release/deployment readiness."
---

# Deploy Readiness

Treat deploy-readiness requests as high-scrutiny reviews, not reassurance.

## Workflow

1. Inspect the actual diff, touched code paths, and relevant callers.
2. Run or verify the checks that match the changed surface.
3. Look for change-specific rollout risks, data risks, cache/state risks, background-job risks, permission risks, and user-visible regressions.
4. Assume routine deploy-script chores are already handled, such as migrations, cache refreshes, queue restarts, and asset deployment.
5. Approve only when the change is genuinely ready; otherwise say what blocks deployment.

## Response

- Lead with the deploy verdict: ready, not ready, or ready with named caveats.
- Mention only change-specific risks and checks.
- Do not pad the answer with generic deployment checklists.
- If QA was done, include the URL, login or fixture data, and exact test data needed for the user to repeat it.
