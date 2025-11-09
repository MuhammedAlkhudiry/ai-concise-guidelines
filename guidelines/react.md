# React guidelines

Hooks first, always at top level. Never in loops/conditions.

Hooks should be grouped by concern (e.g., useState → useQuery → useMemo).

Order inside component: hooks → state → derived values → handlers → JSX.

Non-reactive code (constants, helpers, schemas) stays outside the component.

Avoid inline components/functions in JSX—extract or memoize.

Effects list all dependencies; restructure instead of silencing lints.

Keep state minimal and pure; derive instead of duplicating.

Stable keys for lists, never array indexes (unless static).

Render stays pure: no side-effects, no hidden mutations.

Avoid useEffect when possible.

Minimize use of useState.

Never select entire store (e.g., Zustand: `const state = useStore()`). ALWAYS use a selector.

Prefer hooks libraries over custom logic (e.g., useInterval over setInterval).

Do conditional render (e.g., return null if no data) at the end of component logic, just before returning JSX, NOT mid-component.
