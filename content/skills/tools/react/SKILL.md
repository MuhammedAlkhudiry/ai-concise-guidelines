---
name: react
description: React component and hook work covering component edits, hook correctness, state management, rendering behavior, performance patterns, and clean React code.
---

## Workflow

1. Keep hooks top-level, then derived values, handlers, and JSX return.
2. Group hooks by concern: state/store, data/query, memo, effects.

## Rules

- State holds ground truth and stays normalized; derive instead of duplicate.
- Prefer local state; global only for truly cross-cutting data.
- Use query libraries (React Query/SWR) for server data; never raw fetch in components.
- Query cache is source of truth; do not mirror it locally.
- Never select an entire store (e.g. Zustand); use selectors plus `shallow`.
- Minimize props; prefer whole objects over many primitives.
- No prop drilling; use composition or context.
- Access global stores via hooks, not props.
- Treat required props as required. Do not add `?.`, `??`, placeholder labels, or no-op handlers for required props unless the component explicitly supports an optional mode.
- Keep optional behavior explicit in the prop type, then handle it once near the branch that renders that mode.
- Avoid useEffect when possible; use only for external sync.
- List all dependencies; restructure instead of silencing lints.
- Always clean up timers and subscriptions.
- Keep render pure: no side effects, no mutation.
- Use stable list keys: real IDs, not array indexes.
- Put final conditional renders just before JSX, never between hooks.
- Do not add conditional renders for impossible internal states. Use the existing route, suspense, query, or error boundary.
- No premature optimization; memoize only for real perf issues.
- Use `React.lazy`, framework dynamic imports, or route-level lazy loading only for deliberate code splitting or a concrete runtime boundary.
- Avoid inline objects/functions in JSX that cause re-renders.
