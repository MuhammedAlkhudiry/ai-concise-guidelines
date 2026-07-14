# Visual and Responsive Design

## Layout and spacing

- Use a consistent spacing scale, but correct optical imbalance when strict geometry looks wrong.
- Align to meaningful edges. Near-alignment usually looks more careless than deliberate asymmetry.
- Let whitespace express grouping and priority. Do not compensate for weak hierarchy with containers around everything.
- Keep line lengths, control widths, and content density appropriate to the task.
- Avoid ornamental borders when spacing, background, or elevation already communicates the boundary.
- Design with realistic content: long names, translations, missing images, large numbers, errors, and dense datasets.

## Typography

- Build hierarchy from size, weight, line height, tracking, contrast, and spacing together.
- Adjust line height and tracking for the type size instead of applying one value everywhere.
- Prefer readable text over fashionable low contrast or excessively light weights.
- Support text resizing without clipping, overlap, lost content, or forced horizontal scrolling.
- Use system or well-tested typefaces by default. A custom typeface must justify its legibility, performance, language coverage, and character.
- Use tabular numerals where changing numbers must remain aligned.

## Color and contrast

- Assign color semantic roles—content, surface, border, accent, success, warning, danger—rather than choosing colors independently per screen.
- Maintain readable contrast in light, dark, high-contrast, disabled, hovered, selected, and translucent states.
- Do not rely on color alone for meaning.
- Use accent color selectively so it continues to indicate interactivity or priority.
- Treat dark mode as a designed hierarchy, not a mechanical inversion.

## Icons and imagery

- Use familiar symbols, consistent stroke or fill language, optical size, and alignment.
- Do not mix unrelated icon families without a deliberate reason.
- Label ambiguous icons and every high-consequence icon-only action.
- Ensure decorative imagery does not compete with task content or obscure text.

## Surfaces, depth, and materials

- Use elevation, shadow, translucency, blur, and dimming to explain hierarchy and focus, not as default decoration.
- Larger floating surfaces should generally feel heavier than small controls.
- Use a scrim for blocking modal context; separate nonblocking parallel surfaces without implying that the background is unavailable.
- Avoid stacking translucent surfaces when contrast and legibility collapse.
- Increase foreground contrast over variable or translucent backgrounds.
- Material weight should match hierarchy: structural regions may need heavier separation; lightweight controls should not dominate content.

## Generic visual patterns

- Use containment only when it communicates grouping, interaction, or hierarchy better than spacing and alignment.
- Avoid repeating the same radius, border, shadow, and surface treatment across navigation, panels, controls, and content.
- Do not default to floating sidebars, glass panels, gradients, glows, oversized radii, or dramatic shadows to manufacture polish.
- Avoid interchangeable dashboard compositions such as KPI-card grids, decorative charts, activity rails, and badge-heavy tables unless the product's information model requires them.
- Remove eyebrow labels, explanatory mini-copy, decorative status indicators, and ornamental headings that do not improve comprehension.
- Derive the composition and visual language from the product's tasks, content, platform, existing system, and intended character rather than familiar generated templates.

## Responsive and adaptive design

- Reflow according to content priority and task sequence; do not merely shrink a desktop composition.
- Define what moves, wraps, stacks, collapses, becomes scrollable, or changes interaction model at constrained sizes.
- Preserve the primary action and essential context across breakpoints.
- Avoid horizontal scrolling for ordinary content; use it intentionally for tables, timelines, or canvases that cannot reflow without losing meaning.
- Respect safe areas, virtual keyboards, browser chrome, pointer precision, hover availability, and orientation changes.
- Ensure overlays, sticky controls, and fixed actions do not obscure focused content or final items in a scroll region.
- Test narrow, short, wide, and zoomed viewports, not only named device widths.
- Support localization expansion and right-to-left layout where required. Mirror layout and icons only when their meaning is directional.
