#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import { basename, resolve } from "node:path";
import { $ } from "bun";

const args = new Map<string, string | boolean>();
const positionals: string[] = [];

for (let i = 2; i < Bun.argv.length; i++) {
  const arg = Bun.argv[i];
  if (arg === "--confirm") {
    args.set("confirm", true);
    continue;
  }
  if (arg === "--no-migrate") {
    args.set("migrate", "0");
    continue;
  }
  if (arg.startsWith("--dump=")) {
    args.set("dump", arg.slice("--dump=".length));
    continue;
  }
  positionals.push(arg);
}

const [sshTarget, remoteAppDir, localDirArg] = positionals;
const localDir = resolve(localDirArg || ".");
const dump = String(args.get("dump") || "");
const migrate = args.get("migrate") !== "0";

function usage(): never {
  console.error("Usage:");
  console.error("  import-prod-db-to-ddev.ts --dump=/path/local.sql.gz [local-ddev-dir] [--confirm] [--no-migrate]");
  console.error("  import-prod-db-to-ddev.ts <ssh-target> <remote-laravel-dir> [local-ddev-dir] [--confirm] [--no-migrate]");
  process.exit(1);
}

async function commandExists(command: string): Promise<boolean> {
  return (await $`command -v ${command}`.quiet().nothrow()).exitCode === 0;
}

async function confirm(): Promise<void> {
  if (args.get("confirm") === true || process.env.IMPORT_DB_CONFIRM === "1") return;

  const answer = prompt("This replaces the LOCAL DDEV database. Type IMPORT to continue: ");
  if (answer === "IMPORT") return;

  console.error("Cancelled.");
  process.exit(1);
}

async function importDump(path: string): Promise<void> {
  if (!existsSync(path)) {
    console.error(`Dump not found: ${path}`);
    process.exit(1);
  }

  await confirm();
  await $`ddev import-db --file ${path}`.cwd(localDir);
  if (migrate) await $`ddev artisan migrate`.cwd(localDir);
}

async function importRemote(): Promise<void> {
  if (!sshTarget || !remoteAppDir) usage();

  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
  const outputDump = process.env.IMPORT_DB_DUMP_PATH || `/tmp/prod-db-${basename(localDir)}-${stamp}.sql.gz`;

  await confirm();

  const remoteScript = String.raw`
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

DB_DRIVER="\${cfg[0]}"
DB_HOST="\${cfg[1]}"
DB_PORT="\${cfg[2]}"
DB_NAME="\${cfg[3]}"
DB_USER="\${cfg[4]}"
DB_PASS="\${cfg[5]}"

case "$DB_DRIVER" in
  mysql|mariadb) ;;
  *) echo "Unsupported database driver for mysqldump: \${DB_DRIVER}" >&2; exit 1 ;;
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
  "\${extra_args[@]}" \
  "$DB_NAME" | gzip -c
`;

  console.log(`Remote: ${sshTarget}:${remoteAppDir}`);
  console.log(`Local DDEV project: ${localDir}`);
  console.log(`Dump file: ${outputDump}`);

  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn("ssh", [sshTarget, `REMOTE_APP_DIR=${remoteAppDir}`, "bash", "-s"], {
      stdio: ["pipe", "pipe", "inherit"],
    });
    const output = createWriteStream(outputDump);

    child.stdin.end(remoteScript);
    child.stdout.pipe(output);
    child.on("error", reject);
    child.on("close", (code) => {
      output.close();
      if (code === 0) resolvePromise();
      else reject(new Error(`ssh dump failed with exit code ${code}`));
    });
  });
  await importDump(outputDump);
}

if (!existsSync(localDir)) {
  console.error(`Local DDEV directory not found: ${localDir}`);
  process.exit(1);
}

if (!(await commandExists("ddev"))) {
  console.error("ddev is not installed or not on PATH.");
  process.exit(1);
}

if (dump) {
  await importDump(resolve(dump));
} else {
  await importRemote();
}
