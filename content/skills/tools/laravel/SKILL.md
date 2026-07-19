---
name: laravel
description: Laravel PHP coding, review, and refactor work across controllers, models, migrations, requests, policies, jobs, services, Eloquent, validation, and queues.
---

Use these defaults unless the app has stronger local pattern.

- Important: Prefer fluent chaining for Laravel APIs, query builders, collections, validation rules, responses, mail, and notifications when the chain stays readable.
- Do not pass associative arrays as application data. Once data has a stable shape beyond a boundary, use a typed, immutable, logic-free DTO or value object.
- Use PHP backed enums for constrained values instead of magic strings or integers.
- Prefer Carbon objects over date strings.
- Use Laravel helpers such as `Str`, `Arr`, `Number`, `Uri`, and collections instead of custom parsing or manual manipulation.
- Build query strings with Laravel or framework URL helpers, never manual string concatenation.

- For HTTP endpoints, prefer this flow: route -> controller -> Form Request -> typed DTO or data object -> service or invokable action -> JSON Resource or resource collection.

- Before adding `$fillable` or `$guarded`, check whether the project uses `Model::unguarded()` or `Model::unguard()` globally. If it does, do not add mass-assignment properties.
- Avoid hardcoded table names in queries. Exception: migrations can use hardcoded table names because migrations are frozen snapshots and models can change later.
