---
name: _prod-db-to-ddev
description: Use when importing a production Laravel MySQL database over SSH into a local DDEV database, especially prompts like "import prod db into ddev", "refresh local db from prod", or "pull production database locally".
---

# Production DB To DDEV

Import a production Laravel MySQL database into local DDEV without mutating production.

## Safety Rules

- Production side must be read-only: `php` config reads, optional `mysql SELECT`, and `mysqldump` only.
- Never run migrations, seeders, imports, deletes, updates, or artisan write commands on production.
- Treat local import as destructive: it replaces the local DDEV database.
- Use `--single-transaction --quick` for InnoDB-friendly dumps.
- Disable GTID purging when the available `mysqldump` supports it.
- Run local migrations after import only when the local code is ahead of production.

## Bash Function

```bash
import_prod_db_to_ddev() {
  local ssh_target="${1:?Usage: import_prod_db_to_ddev <ssh-target> <remote-laravel-dir> [local-ddev-dir]}"
  local remote_app_dir="${2:?Usage: import_prod_db_to_ddev <ssh-target> <remote-laravel-dir> [local-ddev-dir]}"
  local local_ddev_dir="${3:-$PWD}"
  local stamp dump confirm

  stamp="$(date +%Y%m%d-%H%M%S)"
  dump="${IMPORT_DB_DUMP_PATH:-/tmp/prod-db-${stamp}.sql.gz}"

  echo "Remote: ${ssh_target}:${remote_app_dir}"
  echo "Local DDEV project: ${local_ddev_dir}"
  echo "Dump file: ${dump}"
  echo
  echo "This will replace the LOCAL DDEV database. Production will only be read with mysqldump."

  if [[ "${IMPORT_DB_CONFIRM:-}" != "1" ]]; then
    read -r -p "Type IMPORT to continue: " confirm
    [[ "$confirm" == "IMPORT" ]] || {
      echo "Cancelled."
      return 1
    }
  fi

  command -v ddev >/dev/null || {
    echo "ddev is not installed or not on PATH." >&2
    return 1
  }

  (
    cd "$local_ddev_dir"

    ssh "$ssh_target" "REMOTE_APP_DIR=$(printf '%q' "$remote_app_dir") bash -s" <<'REMOTE' > "$dump"
set -euo pipefail
cd "$REMOTE_APP_DIR"

mapfile -t cfg < <(php <<'PHP'
<?php
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$default = config('database.default');
$connection = config("database.connections.{$default}");

echo (string) ($connection['driver'] ?? ''), PHP_EOL;
echo (string) ($connection['host'] ?? '127.0.0.1'), PHP_EOL;
echo (string) ($connection['port'] ?? '3306'), PHP_EOL;
echo (string) ($connection['database'] ?? ''), PHP_EOL;
echo (string) ($connection['username'] ?? ''), PHP_EOL;
echo (string) ($connection['password'] ?? ''), PHP_EOL;
PHP
)

DB_DRIVER="${cfg[0]}"
DB_HOST="${cfg[1]}"
DB_PORT="${cfg[2]}"
DB_NAME="${cfg[3]}"
DB_USER="${cfg[4]}"
DB_PASS="${cfg[5]}"

case "$DB_DRIVER" in
  mysql|mariadb) ;;
  *) echo "Unsupported database driver for mysqldump: ${DB_DRIVER}" >&2; exit 1 ;;
esac

extra_args=()
if mysqldump --help 2>/dev/null | grep -q -- '--set-gtid-purged'; then
  extra_args+=(--set-gtid-purged=OFF)
fi

MYSQL_PWD="$DB_PASS" mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --no-tablespaces \
  "${extra_args[@]}" \
  "$DB_NAME" | gzip -c
REMOTE

    ls -lh "$dump"
    ddev import-db --file "$dump"

    if [[ "${IMPORT_DB_MIGRATE:-1}" == "1" ]]; then
      ddev artisan migrate
    fi
  )
}
```

## Example

```bash
import_prod_db_to_ddev forge@example.com /home/forge/app/current /path/to/local/project
```

For Awraq:

```bash
import_prod_db_to_ddev forge@138.68.158.43 /home/forge/awraq.app/family-tree /Users/muhammed/PhpstormProjects/awraq-project
```
