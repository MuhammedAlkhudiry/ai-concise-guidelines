# Context Map Format

Use this when a repo has multiple domain contexts.

`CONTEXT-MAP.md` is only a routing file. It points to the right glossary and ADR locations. It is not a project map, architecture overview, plan, or file index.

```md
# Context Map

## Contexts

- **Ordering**: `src/ordering/CONTEXT.md`
  ADRs: `src/ordering/docs/adr/`
- **Billing**: `src/billing/CONTEXT.md`
  ADRs: `src/billing/docs/adr/`

## System-Wide Decisions

ADRs: `docs/adr/`
```

## Rules

- Create `CONTEXT-MAP.md` only when there are multiple domain contexts.
- Keep a single root `CONTEXT.md` for single-context repos.
- Point to existing context files when they exist.
- Create context files lazily when the first term for that context is resolved.
- Put system-wide ADRs under root `docs/adr/`.
- Put context-specific ADRs next to that context when the repo structure supports it.
