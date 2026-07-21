---
name: react
description: React implementation and review preferences.
---

Follow stronger established project patterns.

- Order component bodies as hooks grouped by concern, derived values, handlers, final conditional renders, then JSX.
- Use a query library for server data; never fetch directly inside components.
- Treat the query cache as the source of truth; do not mirror it in local state.
- Select only the required store state, using shallow equality where appropriate.
- Access global stores through hooks rather than passing their state through props.
- Minimize props and prefer whole domain objects over collections of primitive fields.
- Use lazy loading only for deliberate code splitting or a concrete runtime boundary.
