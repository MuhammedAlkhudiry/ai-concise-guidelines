# Content, Systems, and Review

## UX writing

- Use plain, direct, specific language.
- Name actions with verbs and destinations with nouns users recognize.
- Describe the consequence, not interface mechanics: `Delete account`, not `Click here`.
- Keep headings and labels concise without removing information needed for a safe decision.
- Write errors as: what happened, what remains safe, and what the user can do next.
- Avoid blame, jargon, internal codes, vague reassurance, and false certainty.
- Keep terminology consistent across navigation, content, controls, help, and notifications.
- Design copy for localization: avoid runtime-assembled fragments, unexplained abbreviations, embedded formatting assumptions, and layouts dependent on English length.

## Design-system coherence

- Prefer shared semantic tokens for color, typography, spacing, radius, elevation, and motion.
- Components should encode accessible behavior, interaction states, and strong defaults, not only appearance.
- Base variants on semantic purpose and hierarchy rather than one-off visual combinations.
- Consolidate nearly identical patterns. Repetition with small inconsistencies is more damaging than a deliberately distinct exception.
- Match motion, density, radius, iconography, typography, and material treatment to one product personality.
- Document or encode exceptions when they represent a reusable rule. Do not create an abstraction for a single cosmetic occurrence.
- Judge components in context. A locally polished control can still damage the product if it conflicts with the workflow or visual language.
- Favor strong defaults over option volume. Most people should receive the intended experience without configuration.

## Implementation judgment

- Fix a broken workflow or interaction model before polishing its visual shell.
- Use the established components and tokens when they fit the intended behavior. Do not force a poor interaction into an existing component merely for consistency.
- Validate untrusted content and system boundaries, then keep internal UI state direct and predictable.
- Preserve data, focus, selection, scroll, and navigation context through asynchronous updates.
- Build visuals and interaction together. Motion is not a layer added after static pixels.
- Prototype unfamiliar interactions at usable fidelity before committing to an architecture that cannot reproduce the intended feel.
- Evaluate touch and gesture behavior on a real device when physical interaction matters.
- Review uncertain motion in slow motion and frame by frame; review the whole interface again with fresh eyes.

## Review priorities

Report concrete issues in descending user impact:

1. Blocked, unsafe, destructive, or unrecoverable flows
2. Missing states, broken responsiveness, or inaccessible interaction
3. Unclear hierarchy, navigation, wording, or action priority
4. Missing, delayed, misleading, or excessive feedback
5. Inconsistent components, spacing, typography, color, or iconography
6. Motion that is purposeless, sluggish, physically incoherent, inaccessible, or distracting
7. Polish opportunities that improve trust, personality, or delight

For each issue, identify the affected user goal, current behavior, recommended behavior, and reason. Separate evidence, inference, and aesthetic preference.

Review the composition as a whole for repeated generated defaults. Remove cards, badges, gradients, labels, panels, and other treatments that do not communicate hierarchy, grouping, state, interaction, or product character.

When evaluating alternatives:

- Compare differences in workflow, hierarchy, density, state handling, responsiveness, accessibility, and interaction model—not superficial color or radius variations.
- State the strongest trade-off for each viable direction.
- Recommend one direction using the user's goal and constraints rather than presenting an unranked gallery.
- Reject attractive treatments that obscure the primary task, weaken accessibility, add repeated effort, or conflict with product character.

## Completion standard

UX/UI work is complete only when:

- The primary task and next action are clear.
- Primary, secondary, destructive, exit, and recovery actions have intentional hierarchy.
- Relevant loading, empty, partial, error, permission, offline, disabled, success, and recovery states are handled.
- Feedback is timely, proportional, accessible, and located near its cause.
- Keyboard, touch, pointer, screen-reader, zoom, text-size, contrast, and reduced-motion behavior are accounted for.
- The interface works with realistic content and at relevant viewport sizes.
- Visual hierarchy, spacing, typography, color, icons, surfaces, and motion form a coherent system.
- The experience preserves user context and prevents avoidable loss of work.
- Decorative choices support product purpose and personality instead of competing with them.
