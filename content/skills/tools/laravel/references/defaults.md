# Laravel Defaults

Use these only when the app has no stronger local pattern.

## Types And Data

- Use parameter, return, and property types. Avoid `mixed`, untyped values, and `stdClass`.
- Prefer collections for in-memory data; use arrays for framework boundaries, serialization, or external contracts.
- Use typed, immutable, logic-free DTOs for data crossing real boundaries.
- Use PHP backed enums for constrained values instead of magic strings or integers.
- Prefer Carbon objects over date strings.
- Use Laravel helpers such as `Str`, `Arr`, `Number`, `Uri`, and collections instead of custom parsing or manual manipulation.

## Architecture

- Follow Laravel conventions and do not override defaults without a clear reason.
- Use constructor injection.
- Extract real business operations into invokable action classes.
- Do not add private methods to controllers. Inline the logic when it stays readable, or move it to the right Laravel boundary: an action, service, model method, Form Request, API Resource, policy, or another focused class.
- Prefer procedural application flow over Laravel events unless eventing is the real boundary.
- Avoid tiny scopes for one-off simple queries.
- Avoid Form Requests with an `authorize()` method that only returns `true`.

## Queries And Models

- Do not run queries in per-item code: model accessors, mutators, resources, maps, loops, callbacks, or collection item handlers. Load data upfront with eager loading or a single query.
- Prefer `create()` and `update()` with validated arrays instead of setting attributes one by one before `save()`.
- Before adding `$fillable` or `$guarded`, check whether the project uses `Model::unguarded()` or `Model::unguard()` globally. If it does, do not add mass-assignment properties.
- When no explicit order is specified, sort by `id` or `created_at` descending.
- Avoid hardcoded table names in queries. Exception: migrations can use hardcoded table names because migrations are frozen snapshots and models can change later.

## Responses And Cache

- Use API Resources for JSON responses.
- Use `Cache::remember()` instead of manual get/put logic.
- Use `once()` for per-request memoization.

## Migrations

- Use `php artisan make:migration` for naming and timestamps.
- Use `constrained()` for foreign keys.
- Avoid cascade defaults unless the app intentionally delegates that behavior to the database.
- Never modify deployed migrations.
- If a migration is not deployed, committed, or merged to main, update it instead of adding a correction migration.
- Do not add `down()` methods.
- Keep one concern per migration. Do not mix DDL schema changes and DML data changes.

## Shorter Readable Syntax

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

For request data, use `$request->input('name')`, `$request->string('name')`, or another typed accessor.

## Validation And Tests

- Use Form Requests for non-trivial validation.
- In Form Requests, prefer array validation syntax.
- Use `Rule::when()` for conditional validation.
- Use the `after()` method for custom validation.
- Prefer model assertions over raw database assertions.
- Use factory states, sequences, and `recycle()`.
