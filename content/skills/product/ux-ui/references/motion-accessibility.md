# Motion, Performance, and Accessibility

## Motion purpose and frequency

Motion must provide feedback, preserve spatial context, explain a relationship, indicate state, or soften a jarring change. If it only decorates a frequent action, remove it.

- Make motion shorter and quieter as an action becomes more frequent. Keyboard-driven and extremely frequent actions should usually respond without transition.
- Occasional overlays and state changes can use standard motion.
- Rare, explanatory, first-run, or celebratory moments have more room for delight when they do not block progress.
- Never delay interaction until decorative motion completes.

## Timing and easing

- Entrances and exits generally need immediate response with a gentle landing; use an ease-out character.
- Movement or morphing between visible states generally needs acceleration and deceleration; use an ease-in-out character.
- Constant motion such as a spinner or marquee can be linear.
- Avoid ease-in for interface responses because its slow start feels latent.
- Use these as starting ranges, then judge in context:
  - Press feedback: `100–160ms`
  - Tooltip or small popover: `125–200ms`
  - Dropdown or select: `150–250ms`
  - Modal, drawer, or large surface: `200–500ms`
- Most routine UI motion should settle within roughly `300ms`; larger surfaces and explanatory motion may need longer.
- Deliberate input may be slow; system acknowledgement and release should be fast. Enter and exit timing need not be symmetrical.

## Spatial and physical coherence

- Enter and exit along corresponding paths so objects appear to return where they came from.
- Origin-aware content should emerge from its trigger; viewport-level dialogs can remain centered.
- Do not scale entrances from zero. Begin near full size, commonly `0.9–0.97`, and combine with opacity when scaling is appropriate.
- Use subtle press feedback, commonly around `scale(0.97)`, rather than dramatic shrinkage.
- Keep motion continuous from the current visible state. Rapid changes and reversals must not jump to a stale start value.
- Use spring-like behavior for direct manipulation, momentum, and motion that must carry velocity through interruption.
- Keep routine UI critically damped; reserve visible bounce for momentum-driven or deliberately playful interactions.
- Use short stagger, commonly `30–80ms`, to clarify sequence in a group. Never block interaction while stagger completes.

## Direct manipulation and gestures

- Touch or pointer and content should move together, including outside the object's original bounds.
- Let a moving element be grabbed, reversed, and redirected without waiting for its animation to finish.
- Continue from the current on-screen value and carry release velocity into settling motion.
- Project momentum toward the likely resting point instead of snapping only from the release position.
- Ignore additional touch points after a single-pointer gesture has begun when switching pointers would cause jumps.
- Provide a non-gesture route for essential actions.

## Perceived performance

- Show immediate acknowledgement even when completion takes time.
- Keep useful existing content visible during refreshes instead of replacing the whole screen with a loader.
- Reserve layout space to prevent jumps. Skeletons should mirror stable content structure, not add decorative shimmer everywhere.
- Use optimistic updates only when failure is uncommon, reversible, and clearly reconciled. Otherwise show an honest pending state.
- Prefer progressive disclosure or rendering when partial results are useful.
- Avoid loader flicker for operations that normally complete almost instantly.
- Explain long work, preserve the ability to continue, and communicate completion without demanding attention.
- Motion can improve continuity but must not disguise latency or delay the usable state.
- Avoid layout-shifting motion and expensive effects on busy surfaces.

## Motion comfort

- Honor reduced-motion preferences by replacing movement, zoom, parallax, and bounce with a short fade or static transition.
- Preserve feedback and comprehension under reduced motion; it does not mean removing every state change.
- Avoid full-viewport movement, persistent peripheral motion, flashing, large depth changes, and slow looping oscillation.
- Gate hover-specific motion to devices that support hover.
- Keep persistent animated content interruptible, pausable, or dismissible.
- Honor reduced-transparency and increased-contrast preferences when translucent materials are used.

## Accessibility

- Accessibility is a design input, not a final compliance pass.
- Treat WCAG as a baseline for web work, not proof that an experience works for every person or platform.
- Support keyboard, touch, pointer, screen reader, zoom, text resizing, high contrast, reduced transparency, reduced motion, and color-vision differences where relevant.
- Use semantic controls and native behavior before recreating them.
- Provide programmatic names, roles, values, states, errors, relationships, and status announcements.
- Provide large, separated targets and single-pointer alternatives for multipoint, path-based, drag, or complex gestures.
- Let pointer actions be cancelled before commitment when accidental activation is plausible.
- Keep DOM, reading, focus, and visual order aligned. Do not let sticky or floating UI obscure focused content.
- Make the complete experience usable with keyboard alone. Manage focus when content opens, closes, appears, disappears, or fails; do not move it for passive updates.
- Use semantic headings, landmarks, controls, labels, descriptions, and error associations so structure and state remain understandable nonvisually.
- Provide text alternatives for informative imagery and empty alternatives for decoration. Caption meaningful audio and describe meaningful visual-only information.
- Do not rely on color, position, shape, motion, sound, or haptics as the only signal.
- Avoid unnecessary time limits. Let people pause, extend, or recover when timing is necessary.
- Do not flash content or require animation likely to trigger seizures or vestibular symptoms.
- Test the complete task with representative assistive technology and human evaluation; automated checks alone do not establish accessibility.
