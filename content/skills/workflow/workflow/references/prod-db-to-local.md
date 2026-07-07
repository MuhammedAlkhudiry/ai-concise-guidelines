# Production DB To Local

Import a production Laravel MySQL database into a local Laravel/Herd database while keeping production read-only.

## Safety Rules

- Production may only run `php` config reads, optional `mysql SELECT`, and `mysqldump`.
- Never run migrations, seeders, imports, deletes, updates, or artisan write commands on production.
- Treat local import as destructive: it replaces the local database named by the local `.env`.
- Use `--single-transaction --quick` for InnoDB-friendly dumps.
- Disable GTID purging when the available `mysqldump` supports it.
- Keep local production database dumps in `~/db-dumps`.
- Run local migrations after import only when local code is ahead.

## Script

```bash
bun "$HOME/.agents/skills/workflow/scripts/import-prod-db-to-local.ts" <ssh-target> <remote-laravel-dir> [local-laravel-dir]
bun "$HOME/.agents/skills/workflow/scripts/import-prod-db-to-local.ts" --dump=/path/local.sql.gz [local-laravel-dir]
```

## Example

```bash
bun "$HOME/.agents/skills/workflow/scripts/import-prod-db-to-local.ts" forge@example.com /home/forge/app/current /path/to/local/project
```
