---
name: prod-db-to-local
description: Production-to-local Laravel MySQL imports.
---

## Safety Rules

- Keep production read-only: run only `php` config reads, optional `mysql SELECT`, and `mysqldump`; never run migrations, seeders, imports, deletes, updates, or Artisan write commands.
- Treat local import as destructive: it replaces the local database named by the local `.env`.

## Script

Run `scripts/import-prod-db-to-local.ts --help`, then use the script for the import. Its interface and behavior are authoritative.
