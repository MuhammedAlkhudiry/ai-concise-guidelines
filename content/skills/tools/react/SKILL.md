---
name: react
description: React component and hook work covering component edits, hook correctness, state management, rendering behavior, performance patterns, and clean React code.
---

# React

Defaults for React development.

## Hooks

- Use `sg` before broad `rg` when finding hook calls, JSX component usages, prop patterns, or component shapes.
- Hooks first, top-level only.
- Order: hooks, derived values, handlers, JSX return.
- Group by concern: state/store, data/query, memo, effects.
- Never select an entire store (e.g. Zustand); use selectors plus `shallow`.

## State & Data

- State holds ground truth and stays normalized; derive instead of duplicate.
- Prefer local state; global only for truly cross-cutting data.
- Use query libraries (React Query/SWR) for server data; never raw fetch in components.
- Query cache is source of truth; do not mirror it locally.

## Props & Composition

- Minimize props; prefer whole objects over many primitives.
- No prop drilling; use composition or context.
- Access global stores via hooks, not props.

## Effects & Render

- Avoid useEffect when possible; use only for external sync.
- List all dependencies; restructure instead of silencing lints.
- Always clean up timers and subscriptions.
- Keep render pure: no side effects, no mutation.
- Use stable list keys: real IDs, not array indexes.
- Put final conditional renders just before JSX, never between hooks.

## Performance

- No premature optimization; memoize only for real perf issues.
- Use `React.lazy`, framework dynamic imports, or route-level lazy loading only for deliberate code splitting or a concrete runtime boundary.
- Avoid inline objects/functions in JSX that cause re-renders.
