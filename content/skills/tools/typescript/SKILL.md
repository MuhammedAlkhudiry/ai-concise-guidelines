---
name: typescript
description: TypeScript and JavaScript coding standards for TS/JS edits, type safety, async handling, clean code, and maintainable implementation patterns.
---

# TypeScript / JavaScript

Critical defaults for TypeScript and JavaScript development.

## Types & Safety

- Use strict TypeScript.
- Avoid `any`; use `unknown` only when the value is truly unknown.
- Prefer `interface` for object shapes and `type` for unions/intersections/utilities.
- Add explicit return types on exported functions.
- Use `as const` for literals; avoid type assertions unless unavoidable.

## Code Style

- Use `sg` before broad `rg` when finding imports, exports, function calls, object shapes, or callback patterns.
- `const` by default; `let` only for mutation; never `var`.
- Destructure props/objects at function entry.
- Use arrow functions for callbacks and named functions for top-level/exported functions.
- Build query strings with `URL`, `URLSearchParams`, router helpers, or local API helpers, never manual string concatenation.

## Async & Error Handling

- Await promises or explicitly handle them.
- Use `try`/`catch` when adding useful context.
- Prefer async/await over `.then()` chains.

## Modules & Imports

- Keep imports at the file top, grouped external, internal, then types.
- Prefer named exports; use default exports only where the framework expects them.
- Avoid circular imports.
