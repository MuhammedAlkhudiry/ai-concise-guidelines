---
name: react
description: React component and hook preferences for component structure, server data, stores, props, conditional rendering, and code splitting.
---

Personal preferences beyond standard React practice; defer to a stronger local pattern when one exists.

## Rules
- Keep hooks top-level, then derived values, handlers, and JSX return.
- Group hooks by concern: state/store, data/query, memo, effects.
- Use query libraries (React Query/SWR) for server data; never raw fetch in components.
- Query cache is source of truth; do not mirror it locally.
- Never select an entire store (e.g. Zustand); use selectors plus `shallow`.
- Access global stores via hooks, not props.
- Minimize props; prefer whole objects over many primitives.
- Treat required props as required. Do not add `?.`, `??`, placeholder labels, or no-op handlers for required props unless the component explicitly supports an optional mode.
- Keep optional behavior explicit in the prop type, then handle it once near the branch that renders that mode.
- Put final conditional renders just before JSX, never between hooks.
- Do not add conditional renders for impossible internal states. Use the existing route, suspense, query, or error boundary.
- Use `React.lazy`, framework dynamic imports, or route-level lazy loading only for deliberate code splitting or a concrete runtime boundary.
