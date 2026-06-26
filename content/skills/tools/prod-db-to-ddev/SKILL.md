---
name: prod-db-to-ddev
description: Production Laravel MySQL to local DDEV database imports over SSH, including import prod db into ddev, refresh local db from prod, and pull production database locally prompts.
---

# Production DB To DDEV

Import a production Laravel MySQL database into local DDEV while keeping production read-only.

## Safety Rules

- Production may only run `php` config reads, optional `mysql SELECT`, and `mysqldump`.
- Never run migrations, seeders, imports, deletes, updates, or artisan write commands on production.
- Treat local import as destructive: it replaces the local DDEV database.
- Use `--single-transaction --quick` for InnoDB-friendly dumps.
- Disable GTID purging when the available `mysqldump` supports it.
- Keep local production database dumps in `~/db-dumps`.
- Run local migrations after import only when local code is ahead.

## Script

```bash
bun "$HOME/.agents/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts" <ssh-target> <remote-laravel-dir> [local-ddev-dir]
bun "$HOME/.agents/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts" --dump=/path/local.sql.gz [local-ddev-dir]
```

## Example

```bash
bun "$HOME/.agents/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts" forge@example.com /home/forge/app/current /path/to/local/project
```
