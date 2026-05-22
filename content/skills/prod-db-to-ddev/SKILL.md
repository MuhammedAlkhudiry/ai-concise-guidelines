---
name: prod-db-to-ddev
description: Use when importing a production Laravel MySQL database over SSH into a local DDEV database, especially prompts like "import prod db into ddev", "refresh local db from prod", or "pull production database locally".
---

# Production DB To DDEV

Import a production Laravel MySQL database into local DDEV with production read-only.

## Safety Rules

- Production may only run `php` config reads, optional `mysql SELECT`, and `mysqldump`.
- Never run migrations, seeders, imports, deletes, updates, or artisan write commands on production.
- Treat local import as destructive: it replaces the local DDEV database.
- Use `--single-transaction --quick` for InnoDB-friendly dumps.
- Disable GTID purging when the available `mysqldump` supports it.
- Run local migrations after import only when local code is ahead of production.

## Script

```bash
bun content/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts <ssh-target> <remote-laravel-dir> [local-ddev-dir]
bun content/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts --dump=/path/local.sql.gz [local-ddev-dir]
```

## Example

```bash
bun content/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts forge@example.com /home/forge/app/current /path/to/local/project
```

Awraq example:

```bash
bun content/skills/prod-db-to-ddev/scripts/import-prod-db-to-ddev.ts forge@138.68.158.43 /home/forge/awraq.app/family-tree /Users/muhammed/PhpstormProjects/awraq-project
```
