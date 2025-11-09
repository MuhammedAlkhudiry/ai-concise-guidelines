Hooks first, always at top level. Never in loops/conditions.

Hooks should grouped by concern (e.g. useState -> useQuery -> useMemo).

Order inside component: hooks → state → derived values → handlers → JSX.

Non-reactive code (constants, helpers, schemas) stays outside the component.

Avoid inline components/functions in JSX—extract or memoize.

Effects list all dependencies; restructure instead of silencing lints.

Keep state minimal and pure; derive instead of duplicating.

Stable keys for lists, never array indexes (unless static).

Render stays pure: no side-effects, no hidden mutations.

Avoid using UseEffect as much as possible

Minimize using useState.

Never select everything from a store (e.g. Zustand: const state = useStore()),  ALWAYS use a selector

Prefer using hooks library over implementing custom logic (e.g. useInterval over setInterval)

Do conditional render (e.g. return null if no data) at the end of the component's logic just before returning jsx, NOT in the middle of the component.
