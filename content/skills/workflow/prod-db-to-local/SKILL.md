---
name: prod-db-to-local
description: Production-to-local Laravel MySQL imports that keep production read-only, replace the intended local database safely, preserve dumps, and optionally run local migrations.
---

# Production DB To Local

Import a production Laravel MySQL database into a local Laravel/Herd database while keeping production read-only.

## Safety Rules

- Production may only run `php` config reads, optional `mysql SELECT`, and `mysqldump`.
- Never run migrations, seeders, imports, deletes, updates, or artisan write commands on production.
- Treat local import as destructive: it replaces the local database named by the local `.env`.
- Use `--single-transaction --quick` for InnoDB-friendly dumps.
- Disable GTID purging when the available `mysqldump` supports it.
- Keep local production database dumps in `~/db-dumps`.
- Local migrations run by default after import. Use `--no-migrate` when the user requests it or the project's current state makes migration inappropriate.

## Script

Run `scripts/import-prod-db-to-local.ts --help` for the current invocation, options, and supported
input modes. The script is the source of truth for its interface; this skill owns the production
read-only and local destructive-safety contract.
