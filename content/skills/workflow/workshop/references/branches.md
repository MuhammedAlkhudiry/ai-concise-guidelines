# Workshop Branches

## Code Architecture

Use for architecture, refactors, APIs, data flow, system boundaries, reliability, performance, or maintainability.

Focus on:

- Existing code, contracts, and constraints
- Boundaries, data flow, failure modes, edge cases, and operational complexity
- Trade-offs and rejected alternatives
- Recommended technical shape

Divergence frames:

- Remove the assumed boundary: framework, database, request model, queue, or ownership line.
- Failure operator: design from the outage, abuse case, rollback, or cleanup path backward.
- Runtime mechanic: reason from latency, memory, contention, cache shape, and IO budget.
- Maintenance mechanic: optimize for the smallest long-term surface and clearest ownership.

## UX/UI

Use for user flows, screens, interaction models, layout direction, visual hierarchy, usability, states, accessibility, or design alternatives.

Focus on:

- User intent and workflow friction
- Information hierarchy and interaction model
- Loading, empty, error, permission, accessibility, and responsive states
- Recommended experience direction

Divergence frames:

- First-run user: what makes the path obvious without explanation.
- Power user: what removes repeated effort, waiting, and mode switching.
- Error-state user: what happens when data, permission, connection, or confidence is missing.
- Competitor lens: what another product would make feel simpler, safer, or more valuable.

## Product

Use for user value, adoption, positioning, prioritization, opportunity size, retention, monetization, or what to build next.

Focus on:

- User problem and job-to-be-done
- Why this, why now, and why not something else
- Differentiation and competing alternatives
- Adoption, retention, and business risks
- Recommended product decision

Divergence frames:

- Non-user: why the target user ignores this today.
- Constraint removal: what changes if price, time, data, channel, or trust is no longer fixed.
- Opposite bet: how to guarantee failure, then invert the strongest causes.
- Tiny version: the smallest thing that proves the value without building the full system.

## Divergence Pass

Use only when the decision is open-ended, consequential, and likely to receive a merely familiar answer.

1. Pick 3-5 frames from the chosen branch.
2. Generate short candidate angles independently under each frame.
3. Score candidates by novelty, viability, and fit.
4. Flag attractive traps with the reason they fail.
5. Cluster by underlying angle and deepen only the top 2-3.
6. Return a recommendation, not a brainstorm dump.
