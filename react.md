---
trigger: manual
description: 
globs: 
---

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