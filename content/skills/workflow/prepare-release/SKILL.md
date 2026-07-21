---
name: prepare-release
description: Release preparation, production readiness, and post-release follow-up.
---

## Workflow

1. Inspect the diff, affected product and data flows, and the project's deploy/release source. Distinguish actions already covered by deployment from non-routine release actions.
2. Run $verification for the changed surface and determine whether the release is ready, not ready, or ready with named caveats.
3. Identify change-specific blockers, release actions, rollback constraints, user and stored-data effects, and required support, QA, analytics, or monitoring follow-up.
4. When the release creates temporary scaffolding, schedule its cleanup with a trigger, owner when known, and evidence that removal is safe.
   For requested post-release automation, define each watch with its cadence, stop condition, report signal, and action.
5. Lead with the verdict and include only populated sections: blockers, release actions, product effects, checks, automation, rollback, and cleanup.
