# Laravel

1. Detect Laravel version, first-party packages, PHP constraints, Composer scripts, app structure, test framework, queues, cache, auth, mail, filesystem, broadcasting, Scout/search, Horizon, and Vite integration.
2. Read the official Laravel upgrade guide for the exact version jump before changing framework packages.
3. Upgrade `laravel/framework` and first-party Laravel packages separately from generic Composer packages.
4. Check published configs, service providers, middleware, bootstrap/app wiring, route files, exception handling, validation, auth, policies, Eloquent behavior, casts, factories, queues, mail, cache, filesystem, and scheduler behavior.
5. Apply small fixes directly: config updates, renamed methods, changed defaults, simple service provider changes, factory/test helper updates, and assertion updates.
6. Skip and ask approval for auth rewrites, broad middleware or bootstrap migrations, database-impacting behavior changes, queue semantics changes, app-wide Eloquent changes, or many-file framework migrations.
7. Use Artisan and Laravel checks through the project's established PHP boundary, normally `ddev artisan` in DDEV Laravel repos.
8. Run focused tests first, then Laravel test suites, migration status checks, config/cache checks, queue-related checks, and browser/build checks when the upgrade touches frontend integration.
9. Report each Laravel package with the official guide notes used, version movement, application changes, patch status, checks, and approval-needed skips.
