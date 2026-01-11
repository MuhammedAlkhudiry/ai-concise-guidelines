# UX/UI Design

Practical UI/UX work within an existing design system.

> **When to use**: Working on established products with existing patterns. For new products or landing pages that need to stand out, use `uxui-creative` instead.

**CRITICAL: Think deeply about spacing and layout before writing code.** Analyze spatial relationships and whitespace rhythm. Rushed spacing = amateur UI.

---

## Rules

1. **Analyze the design system first** — spacing scale, type scale, colors, radii, existing patterns
2. **Follow it strictly** — no invented values. Break only with explicit justification
3. **Structure before style** — layout and hierarchy first, then color/shadow/borders
4. **Every value is intentional** — if you can't justify 16px vs 14px, you're guessing
5. **Accessibility is not optional** — semantic HTML, sufficient contrast, keyboard navigable
6. **Mobile-first** — touch targets min 44px, responsive breakpoints, test narrow viewports

---

## Handle All States

Don't just build the happy path:
- **Empty** — no data, first-time user
- **Loading** — skeleton or spinner, preserve layout
- **Error** — clear message, recovery action
- **Edge cases** — long text (truncate), missing images (fallback), overflow

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Inconsistent spacing | Use the scale |
| Too many font sizes | Max 3 per view |
| Borders AND shadows | Pick one |
| No hover/focus states | Clickable = feedback |
| Too tight | Add whitespace |
| Inaccessible | Check contrast, use semantic elements |
| Happy path only | Handle empty, loading, error |

---

## Checklist

- [ ] All spacing/sizing from design system
- [ ] Clear visual hierarchy
- [ ] Hover + focus + disabled states
- [ ] Matches existing patterns
- [ ] Accessible (contrast, keyboard, semantic HTML)
- [ ] All states handled (empty, loading, error)
- [ ] Works on mobile

---

## ULTRATHINK

Trigger: "ULTRATHINK: [question]"

For: component API, layout architecture, new patterns, accessibility deep-dive
