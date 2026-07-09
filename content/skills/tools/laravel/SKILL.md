---
name: laravel
description: Laravel PHP coding, review, and refactor work across controllers, models, migrations, requests, policies, jobs, services, Eloquent, validation, and queues.
---

Use these defaults only when the app has no stronger local pattern.

## Workflow

1. Check sibling files, related controllers, models, and tests first.
2. Run Laravel and PHP commands through Herd unless the project has a stronger local runtime convention.
3. Use `sg` before broad `rg` when finding PHP classes, methods, attributes, Eloquent calls, or chained query shapes.
4. Confirm schema, relationships, requests, policies, queues, cache, and consumers before behavior changes.
5. Follow local conventions over this skill.
6. Always load `references/defaults.md`.

## Rules

- Use typed values, DTOs, Laravel helpers, collections, enums, Carbon, and API Resources where they fit.
- Keep business operations in clear application code, often invokable actions.
- Load data upfront; avoid queries in per-item code, accessors, resources, maps, loops, and callbacks.
- Prefer fluent chaining with Laravel APIs when the chain stays readable.
- Build query strings with Laravel or framework helpers, never manual string concatenation.
- Prefer `create()`, `update()`, eager loading, `Cache::remember()`, `once()`, Form Requests, factory states, and model assertions.
- Keep migrations focused, generated with Artisan, and unchanged once deployed.
