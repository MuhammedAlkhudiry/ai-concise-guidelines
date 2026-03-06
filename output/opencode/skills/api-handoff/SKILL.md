---
name: api-handoff
description: "Create API handoff docs for frontend integration. Use after backend endpoints, validation, and business rules are done, or when the user asks for API documentation or a frontend handoff."
---

# API Handoff

Write a dense handoff doc that lets frontend developers or agents integrate without backend follow-up.

## Use

- If the API is simple CRUD with obvious validation, skip the full template. Provide method, path, auth, and example request/response only.
- Otherwise write or update `docs/ai/<feature-name>/api-handoff.md`. If an older version must stay, create `api-handoff-v2.md`, `api-handoff-v3.md`, and so on.

## Workflow

1. Read the shipped API behavior: endpoints, auth, DTOs, validation, business rules, error cases.
2. Capture only integration-relevant details. Do not dump controller or service internals.
3. Write the handoff with these sections:
   - `# API Handoff: <Feature Name>`
   - `## Business Context`
   - `## Endpoints`
   - `## Data Models / DTOs`
   - `## Enums & Constants`
   - `## Validation Rules`
   - `## Business Logic & Edge Cases`
   - `## Integration Notes`
   - `## Test Scenarios`
   - `## Open Questions / TODOs` when needed
4. Verify the document against actual behavior before finishing.

## Endpoint Format

For each endpoint include:

- Purpose
- Auth requirement
- Example request payload
- Example success response
- Error responses that matter to frontend work
- Notes for pagination, sorting, idempotency, optimistic UI, polling, or other non-obvious behavior

## Rules

- Use real payload shapes and real enum values.
- Include constraints the frontend should mirror for UX.
- Surface hidden behavior explicitly: conditional rules, soft deletes, retries, rate limits, async states, cache invalidation.
- Mention TBD items instead of guessing.
- Write the file only. Do not paste the full handoff into chat unless the platform forces it.
