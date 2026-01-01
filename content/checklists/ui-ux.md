# UI/UX Checklist

## What to Check

### Visual Consistency
- [ ] Colors match design system
- [ ] Typography follows hierarchy
- [ ] Spacing is consistent (use design tokens)
- [ ] Icons are from the same family
- [ ] Borders/shadows follow patterns

### Layout
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] No horizontal scroll on mobile
- [ ] Content doesn't overflow containers
- [ ] Proper alignment (left, center, right)
- [ ] Grid/flex used appropriately

### Interactions
- [ ] Hover states present and consistent
- [ ] Focus states visible (accessibility)
- [ ] Loading states for async actions
- [ ] Error states are clear
- [ ] Success feedback provided

### Usability
- [ ] Actions are discoverable
- [ ] Labels are clear and concise
- [ ] Forms have proper validation feedback
- [ ] Navigation is intuitive
- [ ] Empty states are handled

### Accessibility
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (ARIA labels)
- [ ] Focus order is logical
- [ ] Text is resizable

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | Broken layout, inaccessible to keyboard users, critical flow broken |
| **Should Fix** | Missing hover states, inconsistent spacing, poor mobile experience |
| **Minor** | Slight alignment issues, could use better animation, minor polish |

---

## Common Issues

### Missing Loading State
```tsx
// BAD - no feedback
<button onClick={submit}>Submit</button>

// GOOD - loading feedback
<button onClick={submit} disabled={loading}>
  {loading ? <Spinner /> : 'Submit'}
</button>
```

### Missing Focus State
```css
/* BAD - removes focus */
button:focus { outline: none; }

/* GOOD - custom focus */
button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

### Hardcoded Dimensions
```css
/* BAD - fixed width */
.card { width: 300px; }

/* GOOD - responsive */
.card { 
  width: 100%;
  max-width: 300px;
}
```

---

## Rules

1. **Test on real devices** — Emulators miss touch issues
2. **Check dark mode** — If supported, test both themes
3. **Keyboard first** — Navigate without mouse
4. **Slow network** — Test with throttling
5. **Content extremes** — Test with very short and very long content
