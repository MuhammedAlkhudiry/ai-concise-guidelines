---
name: audit-contract
description: Contract consistency audits across APIs, frontend/mobile types, schemas, clients, validators, runtime payloads, webhooks/queues, SDK/provider models, docs, and drift.
---

# Audit Contract

Audit whether two sides of a boundary share the same contract.

## Workflow

1. Identify the boundary, name each side, and determine the source of truth if clear. Otherwise audit both directions and mark it unresolved.
2. Inventory contract units: endpoints, operations, resources, events, payloads, models, validators, generated files, docs, tests, and fixtures.
3. For large surfaces, create a WIP report from `references/wip-report-template.md`, split non-overlapping slices, and use subagents for read-only inventory or audits.
4. Compare each unit for shape, naming, requiredness, nullability, values, formats, defaults, auth, permissions, status/error shapes, pagination, versioning, and transforms.
5. Write findings to the WIP report as they are found. Keep progress, slice ownership, decisions, attempted fixes, verification, and remaining work current.
6. Unless the user asked for audit-only, fix findings after the audit queue is clear enough to act.
   Update the report until every finding is resolved, blocked, or intentionally deferred.

## Evidence

Prefer mechanically traceable sources:

- Schemas: OpenAPI, GraphQL, JSON Schema, protobuf, generated clients, SDK declarations.
- Runtime code: route handlers, controllers, serializers/resources, request validators, DTOs, form requests, Zod/Yup/io-ts schemas, decoders, mappers.
- Consumers: TypeScript interfaces, API clients, mobile models, React Query hooks, fixtures, mocked responses, tests, screens, feature flows.
- Documentation: endpoint docs, webhook docs, event catalogs, examples, changelogs, migration notes.

Use generated artifacts only after checking how they are produced; flag stale generated files separately.

## Findings

Classify findings by contract risk:

- `breaking`: one side can send or expect data the other side cannot accept or produce.
- `unsafe`: behavior may work for common cases but fails for nulls, missing fields, enum expansion, error paths, auth, pagination, or format edge cases.
- `stale`: generated code, docs, fixtures, mocks, or examples no longer match the implementation.
- `ambiguous`: either side could be correct and a product or architecture decision is needed.
- `aligned`: checked and no meaningful mismatch found.

For each non-aligned finding, include the contract unit, both evidence locations, mismatch, likely impact, and smallest correct fix direction.

Treat the WIP report as durable agent state, not a user-facing deliverable; keep it current enough to resume without rediscovery.
