# Workshop Branches

## Code Architecture

Use for architecture, refactors, APIs, data flow, system boundaries, reliability, performance, or maintainability.

Focus on:

- Existing code, contracts, and constraints
- Boundaries, data flow, failure modes, edge cases, and operational complexity
- Trade-offs and rejected alternatives
- Recommended technical shape

Trace:

- Entry points, callers, consumers, and generated side effects
- Data model, ownership boundaries, permissions, and external contracts
- State transitions, async work, retries, idempotency, and rollback paths
- Runtime costs: queries, network calls, caches, queues, locks, memory, and fan-out
- Test surface, observability, migration path, and cleanup requirements

Pressure-test with:

- What breaks if the input is stale, duplicated, partial, late, or malicious?
- What invariant must stay true before, during, and after the change?
- Which boundary is real, and which boundary exists only because the current code is shaped that way?
- What complexity is being introduced, moved, or deleted?
- What is the simplest correct version that still respects production contracts?

Divergence frames:

- Remove the assumed boundary: framework, database, request model, queue, or ownership line.
- Failure operator: design from the outage, abuse case, rollback, or cleanup path backward.
- Runtime mechanic: reason from latency, memory, contention, cache shape, and IO budget.
- Maintenance mechanic: optimize for the smallest long-term surface and clearest ownership.

Recommend by naming:

- The target boundary and the code paths it affects
- The data flow before and after the change
- The riskiest assumption and how to verify it
- The implementation shape that removes the most complexity

## UX/UI

Use for user flows, screens, interaction models, layout direction, visual hierarchy, usability, states, accessibility, or design alternatives.

Focus on:

- User intent and workflow friction
- Information hierarchy and interaction model
- Loading, empty, error, permission, accessibility, and responsive states
- Recommended experience direction

Trace:

- The user's starting context, goal, next best action, and exit path
- Primary, secondary, destructive, and recovery actions
- Content hierarchy, density, labels, affordances, and scan order
- State coverage across loading, empty, partial, error, disabled, permission, offline, and success
- Keyboard, screen reader, touch, responsive, and localization constraints

Pressure-test with:

- What decision does the user need to make at each step?
- What is obvious only because the builder already understands the system?
- Where does the flow create waiting, mode switching, double entry, or avoidable reading?
- Which state would make the experience feel broken if it were not designed?
- What should be removed, merged, renamed, or moved closer to the user's intent?

Divergence frames:

- First-run user: what makes the path obvious without explanation.
- Power user: what removes repeated effort, waiting, and mode switching.
- Error-state user: what happens when data, permission, connection, or confidence is missing.
- Competitor lens: what another product would make feel simpler, safer, or more valuable.

Recommend by naming:

- The primary workflow and the user's next action at each step
- The hierarchy of controls, content, and feedback
- The states that must be designed before the idea is buildable
- The interaction model that best matches the user's mental model

## Product

Use for user value, adoption, positioning, prioritization, opportunity size, retention, monetization, or what to build next.

Focus on:

- User problem and job-to-be-done
- Why this, why now, and why not something else
- Differentiation and competing alternatives
- Adoption, retention, and business risks
- Recommended product decision

Trace:

- Target user, triggering situation, current workaround, and switching cost
- Frequency, urgency, value, and willingness to change behavior
- Existing alternatives, indirect competitors, and reasons users keep using them
- Activation path, retention loop, pricing or packaging impact, and support burden
- Evidence source: product data, user quotes, market signals, operational pain, or strategic bet

Pressure-test with:

- What user pain becomes meaningfully smaller if this ships?
- Why would the target user choose this over doing nothing?
- What must be true for adoption, retention, and differentiation to hold?
- What attractive version of the idea is still not worth building?
- Which smaller proof would change the decision with the least effort?

Divergence frames:

- Non-user: why the target user ignores this today.
- Constraint removal: what changes if price, time, data, channel, or trust is no longer fixed.
- Opposite bet: how to guarantee failure, then invert the strongest causes.
- Tiny version: the smallest thing that proves the value without building the full system.

Recommend by naming:

- The clearest user segment and use case
- The strongest reason to build or not build now
- The adoption and retention risk that matters most
- The product bet, proof point, and decision threshold

## Divergence Pass

Use only when the decision is open-ended, consequential, and likely to receive a merely familiar answer.

1. Pick 3-5 frames from the chosen branch.
2. Generate short candidate angles independently under each frame.
3. Score candidates by novelty, viability, and fit.
4. Flag attractive traps with the reason they fail.
5. Cluster by underlying angle and deepen only the top 2-3.
6. Return a recommendation, not a brainstorm dump.
