---
name: typescript
description: TypeScript and JavaScript coding standards for TS/JS edits, type safety, async handling, clean code, and maintainable implementation patterns.
---

# TypeScript / JavaScript

Defaults for TypeScript and JavaScript development.

## Types & Safety

- Use strict TypeScript.
- Avoid `any`; use `unknown` only when the value is truly unknown.
- Prefer `interface` for object shapes and `type` for unions/intersections/utilities.
- Add explicit return types on exported functions.
- Use `as const` for literals; avoid type assertions unless unavoidable.
- Trust established TypeScript contracts inside the application. Do not add optional chaining, nullish defaults, `Array.isArray`, `typeof`, or shape guards around values that are already typed, parsed, or owned by the current module.
- Validate untrusted data once at the boundary: HTTP responses, storage, URL params, environment variables, user input, external webhooks, or cross-language payloads. After parsing, pass typed values through the internal flow.
- Prefer a clear throw or invariant failure when a required internal value is missing. Do not silently return empty arrays, default objects, or skipped work for states the contract says cannot happen.

## Code Style

- Use `sg` before broad `rg` when finding imports, exports, function calls, object shapes, or callback patterns.
- `const` by default; `let` only for mutation; never `var`.
- Destructure props/objects at function entry.
- Use arrow functions for callbacks and named functions for top-level/exported functions.
- Build query strings with `URL`, `URLSearchParams`, router helpers, or local API helpers, never manual string concatenation.

## Async & Error Handling

- Await promises or explicitly handle them.
- Use `try`/`catch` when adding useful context.
- Do not wrap local async calls in `try`/`catch` just to return `null`, `false`, or an empty collection. Let existing error boundaries, framework handlers, or callers handle failures unless this layer can recover meaningfully.
- Prefer async/await over `.then()` chains.

## Modules & Imports

- Keep imports at the file top, grouped external, internal, then types.
- Prefer named exports; use default exports only where the framework expects them.
- Avoid dynamic `import()` for ordinary module loading; use it only for deliberate code splitting, optional dependency isolation, or another concrete runtime boundary.
- Avoid circular imports.
