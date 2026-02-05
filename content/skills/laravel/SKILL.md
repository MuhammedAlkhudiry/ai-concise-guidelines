---
name: laravel
description: "Laravel/PHP coding standards. Use when working on Laravel backend to ensure proper architecture, Eloquent usage, and PHP type safety."
---

# Laravel / PHP

Critical rules for Laravel and PHP development.

---

## PHP & Types

- Follow PSR-12 or project standard
- Always use param + return types; avoid `mixed`/untyped
- Typed properties; no `stdClass` or loose arrays
- Small, single-responsibility methods; composition over inheritance

## DTOs & Enums

- Use DTOs for data crossing boundaries; typed, immutable, no logic
- Named constructors (`fromRequest`, `fromModel`) only when needed
- PHP backed enums for constrained values; no magic strings/ints

## Architecture

- Controllers thin; domain logic in models/services/actions
- DI + container; reuse events/listeners/jobs if project uses them
- Route model binding; resourceful routes when natural
- Form Requests or `$request->validate()` consistently; policies for auth

## Eloquent

- Use relationships, scopes, casts; avoid raw SQL unless necessary
- Prevent N+1 with `with()` / `loadMissing()`
- **No queries in looping contexts** — Never execute queries inside model accessors/mutators, Resource `toArray()`, `->map()`/`->each()` callbacks, or any code that runs per-item in a collection. These are hidden N+1 traps. Load all data upfront via eager loading or a single query before the loop.
- **Prefer `create()`/`update()` with arrays** — Don't set attributes one-by-one then `->save()` without reason. Use mass assignment with validated data.
- **Check before adding `$fillable`/`$guarded`** — Before adding mass assignment protection to a model, check if the project uses `Model::unguarded()` or `Model::unguard()` globally. If so, `$fillable` and `$guarded` are forbidden — they have no effect and add noise.

## Views & API

- No DB queries in views; prepare data in controllers
- **Always use API Resources** for JSON responses. Never manually build arrays, `->map()` collections, or hand-craft JSON in controllers/services. Resources handle formatting, conditional fields, and nested relationships cleanly.

## Safety

- No DB schema or env changes unless requested
- Use `config()` for tunables; no hardcoded secrets
