# Foundations

## Start with the task

- Begin with the user's job, starting context, constraints, and desired outcome—not the requested screen or component.
- Keep only what helps the user understand, decide, act, or recover.
- Make the next action clear without hiding secondary or expert capability.
- Remove avoidable steps, repeated entry, unnecessary reading, waiting, and mode switching.
- Group and name information by the user's mental model and decisions, not backend entities or implementation ownership.
- Keep controls close to what they affect and arrange them to mirror the resulting change.
- Avoid dead ends. Empty, error, permission, and completion states need a useful next action when one exists.
- In multi-step flows, show progress, scope, previous choices, validation, and the cost of leaving. Do not force a wizard when work can be completed safely in context.

## Preserve agency and context

- Avoid forced paths, hidden mode changes, surprise navigation, input lockouts, and actions that cannot be interrupted.
- Prefer undo for reversible actions. Reserve confirmation for consequential, unexpected, or difficult-to-recover actions.
- Explain permissions and sensitive data use when relevant. Ask only for what the task requires.
- Preserve work, position, selections, filters, and context through errors, refreshes, navigation, and responsive changes.
- Make consequences clear before destructive, financial, privacy-sensitive, or externally visible commitment.

## Use familiar, coherent patterns

- Elements that look alike must behave alike. Keep the same action's label, icon, placement, and feedback consistent.
- Break a convention only when the alternative improves clarity, speed, safety, or control.
- Keep spatial relationships stable so people can predict where content and controls will appear.
- Support different devices, viewports, input methods, abilities, languages, content lengths, and expertise levels.
- Adapt to the platform: touch favors direct, forgiving targets; keyboard favors speed; pointer interfaces can support density and precision.
- Do not make personalization compensate for a weak default. Ship a strong default, then allow useful adjustment where needs genuinely differ.
- Match interaction, content, visuals, and motion to one product character.
- Treat alignment, wording, timing, focus behavior, and edge cases as product quality.
- Delight should grow from clarity, responsiveness, coherence, and care—not decoration added in their place.

## Hierarchy and actions

- Establish one clear primary action per decision context. Multiple equally loud actions create hesitation.
- Keep secondary actions available without letting them compete with the primary action.
- Separate destructive actions visually and label them with the actual consequence.
- Use emphasis in proportion to importance. Size, weight, contrast, color, placement, and motion all contribute; do not maximize all at once.
- Put important content and actions early in the visual and scan order.
- Favor recognition over recall: expose relevant options, current values, constraints, and examples at the point of decision.
- Keep repeated actions in stable positions. Avoid moving targets after validation, loading, or selection.
- Disable an action only when the user can understand why. Explain unmet requirements nearby when useful.
- Name destinations and actions specifically. Prefer `Library`, `Progress`, or `Save changes` over `Home`, `Manage`, or `OK`.

## State coverage

Design each relevant state explicitly:

- Initial and first-run
- Loading and refreshing
- Empty and no-results
- Partial or stale data
- Success and completion
- Inline validation and submission failure
- Recoverable and terminal error
- Offline, timeout, and reconnecting
- Missing permission or insufficient access
- Disabled, unavailable, read-only, and archived
- Optimistic, pending, queued, and background work
- Conflict, duplicate, and concurrent modification

## Feedback

- Acknowledge input immediately. Pressed, selected, dragged, focused, and pending states should not wait for the final result.
- Match feedback strength to significance. Passive status belongs near affected content; interruption belongs to urgent, actionable risks.
- Communicate status, completion, warning, and error distinctly.
- Confirm important completions, not every routine success. Over-confirmation becomes noise.
- Validate near the field or action needing correction. Preserve entered values and explain recovery.
- Do not use color, motion, sound, or haptics as the only signal. Combine modalities when the consequence matters.
- Announce asynchronous status changes to assistive technology without unexpectedly moving focus.
