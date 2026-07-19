# Interaction and Components

## Interaction design

- Respond visually on press or pointer-down; commit activation on release so the user can cancel by moving away when the platform supports it.
- Do not lock input merely because a transition is playing. Let reversible interactions be interrupted and reversed.
- Keep hit areas forgiving and prevent adjacent targets from competing.
- Distinguish hover, focus, active, selected, disabled, loading, and destructive states. Do not make hover the only route to information or actions.
- Use direct manipulation when it shortens the mental path between intent and result. Keep an equivalent non-gesture method.
- Keep direct-manipulation feedback continuous and preserve the grab offset so content does not jump to the pointer's center.
- Use a small movement threshold before treating a press as a drag. Once intent is clear, track directly.
- Allow gestures to reverse naturally. Use velocity and direction, not distance alone, when they better express intent.
- At drag boundaries, prefer progressive resistance and snap-back over a hard stop.
- Avoid hidden gestures as the sole route to essential actions.
- Minimize gesture-disambiguation delays. Do not add double-click or double-tap unless it earns the delay imposed on the single action.

## Buttons and controls

- Match visual weight to action priority; do not style secondary actions as primary.
- Pair icons with labels when meaning is not universally familiar or space is not genuinely constrained.
- Reserve destructive styling for commitment, not ordinary navigation toward a destructive setting.
- Preserve label width and layout stability during loading where possible. Show pending state without erasing the action's meaning.

## Forms

- Ask only for information needed at the current point in the flow.
- Use persistent labels; placeholders are examples or hints, not label replacements.
- Match controls to answers: toggles for immediate binary settings, checkboxes for independent choices, radios for a visible exclusive set, selects for longer sets, and free text only when structure is not useful.
- Put requirements and formatting guidance before the error they prevent.
- Validate at a useful time: avoid punishing incomplete input while the user is typing, but do not defer all feedback until submission.
- Preserve input after errors, focus the first actionable issue when appropriate, and provide an error summary for long forms.
- Mark optional fields when ambiguity would cause effort.

## Navigation

- Use stable, specific destinations and show the current location.
- Keep global navigation separate from local task actions.
- Do not hide essential desktop navigation behind a menu merely to look minimal.
- On smaller screens, prioritize and regroup navigation rather than shrinking the desktop structure.
- Keep back behavior, breadcrumbs, selected navigation, titles, transitions, and deep links consistent.
- Avoid trapping users in overlays or nested navigation states.

## Overlays, menus, and tooltips

- Use a modal only for a focused task that must interrupt context. Use a nonmodal panel when the user needs to compare or continue working.
- Make dismissal predictable: explicit close, Escape where available, and outside click only when accidental dismissal cannot lose work.
- Keep focus within a modal while open and return it to the invoking control after dismissal.
- Anchor menus, popovers, and tooltips spatially to their trigger. Centered dialogs are an exception because they belong to the viewport.
- Tooltips supplement concise controls; they must not contain essential instructions or interactive content.
- Delay the first tooltip enough to avoid accidents, then allow adjacent tooltips to appear quickly while exploring a toolbar.

## Lists, tables, and data-dense interfaces

- Optimize for scanning, comparison, and repeated action rather than decorative card layouts.
- Align comparable values, keep headers visible when useful, and use tabular numerals for changing numeric data.
- Preserve sort, filter, pagination, selection, and scroll context through updates.
- Make row and bulk actions discoverable without covering the data.
- Distinguish no data from no matching results and provide the correct recovery for each.
- Use density intentionally. Compact interfaces still need readable hierarchy, focus visibility, and adequate targets.

## Notifications and progress

- Use inline feedback for a specific object, a toast for brief nonblocking confirmation, and an alert only when interruption is justified.
- Do not make important recovery information disappear automatically.
- Use determinate progress when it can be measured; use indeterminate activity only when it cannot.
- For long background work, let the user leave and explain how completion or failure will be communicated.
