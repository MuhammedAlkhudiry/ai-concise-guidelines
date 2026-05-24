---
name: laravel
description: Use when writing, reviewing, or refactoring Laravel PHP code, including controllers, models, migrations, requests, policies, jobs, services, Eloquent queries, validation, authorization, queues, caching, and performance.
---

# Laravel Best Practices

Use these defaults only when the app has no stronger local pattern.

## Workflow

1. Check sibling files, related controllers, models, and tests first.
2. Confirm schema, relationships, requests, policies, queues, cache, and consumers before behavior changes.
3. Follow local conventions over this skill.
4. Load `references/defaults.md` when the task needs Laravel-specific defaults.

## Defaults

- Use typed values, Laravel helpers, collections, enums, Carbon objects, and API Resources where they fit.
- Keep business operations in clear application code, often invokable actions.
- Load data upfront; avoid queries in per-item code, accessors, resources, maps, loops, and callbacks.
- Prefer `create()`, `update()`, eager loading, `Cache::remember()`, `once()`, Form Requests, factory states, and model assertions.
- Keep migrations focused, generated with Artisan, and unchanged once deployed.
