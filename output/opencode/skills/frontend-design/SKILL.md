---
name: frontend-design
description: "Frontend UI design guidance for both existing design systems and distinctive new interfaces. Use for layout, spacing, hierarchy, states, accessibility, typography, color, motion, and responsive visual polish."
---

# Frontend Design

Design the interface before styling details. Start by classifying the work:

- **System-fit**: Existing product, design system, or established patterns
- **Distinctive**: New product, landing page, marketing surface, or work that must stand out

If the classification is unclear, inspect the current UI first and follow what already exists.

## Non-Negotiables

1. Analyze structure first: layout, spacing rhythm, hierarchy, and responsive behavior.
2. Make every value intentional. If a size, weight, or color cannot be justified, it is probably wrong.
3. Handle all states: default, hover, focus, disabled, loading, empty, error.
4. Keep the UI accessible: semantic HTML, keyboard support, visible focus, sufficient contrast.
5. Verify mobile behavior: narrow widths, touch targets, wrapping, overflow, and long content.

## System-Fit

When working inside an existing product:

1. Read the design system first: spacing scale, type scale, colors, radii, shadows, and common patterns.
2. Reuse existing components, tokens, and conventions before inventing anything new.
3. Structure before decoration. Fix hierarchy and spacing before borders, shadows, or color tweaks.
4. Keep the visual language tight: avoid too many font sizes, mixed border-plus-shadow treatments, or inconsistent spacing.

### Common Failures

- Hardcoded values that ignore the existing scale
- Happy-path-only UI with missing loading, empty, or error states
- Clickable elements without hover or focus feedback
- Fixed widths that break on smaller screens

## Distinctive

When the interface needs a stronger visual identity:

1. Pick a clear theme first. The whole page should feel coherent, not randomly decorated.
2. Use typography with contrast: different heading/body roles, deliberate weights, and clear hierarchy.
3. Build a custom palette instead of falling back to default Tailwind-style colors or generic purple gradients.
4. Break predictable layouts with asymmetry, overlap, bold whitespace, or stronger composition.
5. Use a small number of high-impact motions. Animate important moments, not everything.
6. Give backgrounds depth with gradients, texture, shapes, or subtle patterns.

### Avoid Generic Output

- Default font stacks everywhere
- Symmetrical, interchangeable hero sections
- Overused blur/glass effects
- Animation on every element
- Trendy color choices without a clear visual direction

## Quick Checks

- [ ] Layout and spacing feel intentional
- [ ] States are complete
- [ ] Accessibility basics are covered
- [ ] Mobile layout holds up
- [ ] Existing systems are respected, or the new theme is clearly cohesive
- [ ] The result does not look generic

## ULTRATHINK

Trigger: `ULTRATHINK: [question]`

Use for layout architecture, theme direction, typography pairing, animation choices, and accessibility tradeoffs.
