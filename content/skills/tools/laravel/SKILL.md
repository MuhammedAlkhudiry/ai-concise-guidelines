---
name: laravel
description: Laravel implementation and review preferences.
---

Follow stronger established project patterns.

## Style

- Prefer readable fluent chains for Laravel APIs, queries, collections, validation, responses, mail, and notifications.
- Represent stable application data with typed, immutable, logic-free DTOs or value objects instead of associative arrays.
- Use backed enums for constrained values instead of magic strings or integers.
- Use Carbon rather than date strings inside application code.
- Prefer Laravel helpers and collections over custom parsing, manipulation, or query-string construction.

## HTTP

Prefer: route → controller → Form Request → typed data object → service or invokable action → JSON Resource or resource collection.

## Configuration

Treat environment variables as scarce. Prefer, in order:

1. A class constant for values that change only with code.
2. A config value when changing it through a redeploy is acceptable.
3. An environment variable for runtime-specific values.

## Eloquent

- Before adding `$fillable` or `$guarded`, check for global `Model::unguarded()` or `Model::unguard()`. Do not add mass-assignment properties when
  global unguarding is active.
- Avoid hardcoded table names in queries. Migrations may use them because they are frozen snapshots.
