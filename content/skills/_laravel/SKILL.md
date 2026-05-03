---
name: _laravel
description: "Apply this skill whenever writing, reviewing, or refactoring Laravel PHP code. This includes creating or modifying controllers, models, migrations, form requests, policies, jobs, scheduled commands, service classes, and Eloquent queries. Triggers for N+1 and query performance issues, caching strategies, authorization and security patterns, validation, error handling, queue and job configuration, route definitions, and architectural decisions. Also use for Laravel code reviews and refactoring existing Laravel code to follow best practices. Covers any task involving Laravel backend PHP code patterns."
license: MIT
metadata:
  author: laravel
---

# Laravel Best Practices

Use these defaults when writing, reviewing, or refactoring Laravel code.

## Consistency First

Before applying any rule, check what the application already does. Laravel offers multiple valid approaches, and the best choice is usually the one the codebase already uses.

Check sibling files, related controllers, models, and tests for established patterns. If one exists, follow it. These rules are defaults for when no clear local pattern exists.

## Types And Data

- Use parameter and return types; avoid `mixed` and untyped values.
- Use typed properties instead of `stdClass`.
- Prefer collections for in-memory data handling. Use arrays only for framework boundaries, serialization, or external contracts.
- Use typed, immutable, logic-free DTOs for data crossing boundaries.
- Use PHP backed enums for constrained values instead of magic strings or integers.
- Prefer Carbon objects over date strings.
- Use Laravel helpers such as `Str`, `Arr`, `Number`, `Uri`, and collections instead of custom parsing or manual manipulation.

## Architecture

- Follow Laravel conventions and do not override defaults without a clear reason.
- Use constructor injection. Avoid `app()` and `resolve()` inside classes.
- Extract discrete business operations into invokable action classes.
- Prefer procedural application flow over Laravel events unless eventing is the real boundary.
- Avoid tiny scopes for one-off views or simple queries like `where('status', 1)`.
- Avoid Form Requests with an `authorize()` method that only returns `true`.

## Queries And Models

- Do not run queries in looping contexts: model accessors or mutators, resource `toArray()`, `->map()` or `->each()` callbacks, or any per-item code. Load data upfront with eager loading or a single query before the loop.
- Prefer `create()` and `update()` with validated arrays instead of setting attributes one by one before `save()`.
- When no explicit order is specified, sort by `id` or `created_at` descending.
- Avoid hardcoded table names in queries. Exception: migrations can use hardcoded table names because migrations are frozen snapshots and models can change later.

## Responses

- Use API Resources for JSON responses. Do not hand-craft response arrays in controllers or services when a resource should own formatting, conditional fields, and nested relationships.

## Cache

- Use `Cache::remember()` instead of manual get/put logic.
- Use `once()` for per-request memoization.

## Migrations

- Always use `php artisan make:migration` for consistent naming and timestamps.
- Use `constrained()` for foreign keys.
- Avoid cascade defaults unless the app intentionally delegates that behavior to the database.
- Never modify deployed migrations.
- If a migration is not deployed, not committed, or not merged to main, update that migration and adjust the local schema if it already ran locally.
- Do not add `down()` methods.
- Keep one concern per migration. Do not mix DDL schema changes and DML data changes.

## Prefer Shorter Readable Syntax

| Verbose | Shorter |
|---------|---------|
| `Session::get('cart')` | `session('cart')` |
| `$request->session()->get('cart')` | `session('cart')` |
| `return Redirect::back()` | `return back()` |
| `Carbon::now()` | `now()` |
| `->where('column', '=', 1)` | `->where('column', 1)` |
| `->orderBy('created_at', 'desc')` | `->latest()` |
| `->orderBy('created_at', 'asc')` | `->oldest()` |
| `->first()->name` | `->value('name')` |

For request data, use `$request->input('name')`, `$request->string('name')`, or another typed request accessor instead of `$request->name`.

## Validation

- Extract validation from controllers into dedicated Form Request classes.
- In Form Requests, prefer array validation syntax.
- Use `Rule::when()` for conditional validation.
- Use the `after()` method for custom validation.

## Tests

- Prefer model assertions over raw database assertions.
- Use factory states and sequences.
- Use `recycle()` to share relationship instances across factories.
