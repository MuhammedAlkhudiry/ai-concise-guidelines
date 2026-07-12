#!/usr/bin/env bun

import { createWriteStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { $ } from "bun";

process.env.PATH = `${process.env.HOME}/Library/Application Support/Herd/bin:${process.env.PATH ?? ""}`;

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

type DbConfig = {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
};

function usage(): never {
  console.error("Usage:");
  console.error("  import-prod-db-to-local.ts --dump=/path/local.sql.gz [local-laravel-dir] [--confirm] [--no-migrate]");
  console.error("  import-prod-db-to-local.ts <ssh-target> <remote-laravel-dir> [local-laravel-dir] [--confirm] [--no-migrate]");
  process.exit(1);
}

async function commandExists(command: string): Promise<boolean> {
  return (await $`command -v ${command}`.quiet().nothrow()).exitCode === 0;
}

async function confirm(): Promise<void> {
  if (args.get("confirm") === true || process.env.IMPORT_DB_CONFIRM === "1") return;

  const answer = prompt("This replaces the LOCAL database from this project's .env. Type IMPORT to continue: ");
  if (answer === "IMPORT") return;

  console.error("Cancelled.");
  process.exit(1);
}

function parseEnv(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const value = match[2].trim();
    env[match[1]] = value.replace(/^(['"])(.*)\1$/, "$2");
  }
  return env;
}

function localDbConfig(): DbConfig {
  const envPath = join(localDir, ".env");
  if (!existsSync(envPath)) {
    console.error(`Local Laravel .env not found: ${envPath}`);
    process.exit(1);
  }

  const env = parseEnv(envPath);
  const database = env.DB_DATABASE;
  if (!database) {
    console.error("DB_DATABASE is missing from local .env.");
    process.exit(1);
  }

  return {
    host: env.DB_HOST || "127.0.0.1",
    port: env.DB_PORT || "3306",
    database,
    username: env.DB_USERNAME || "root",
    password: env.DB_PASSWORD || "",
  };
}

function mysqlEnv(config: DbConfig): Record<string, string> {
  return {
    DB_HOST: config.host,
    DB_PORT: config.port,
    DB_DATABASE: config.database,
    DB_USERNAME: config.username,
    DB_PASSWORD: config.password,
  };
}

function quoteIdentifier(identifier: string): string {
  return `\`${identifier.replaceAll("`", "``")}\``;
}

async function importDump(path: string): Promise<void> {
  if (!existsSync(path)) {
    console.error(`Dump not found: ${path}`);
    process.exit(1);
  }

  if (!(await commandExists("mysql"))) {
    console.error("mysql is not installed or not on PATH.");
    process.exit(1);
  }

  await confirm();

  const config = localDbConfig();
  const database = quoteIdentifier(config.database);

  await $`mysql -h ${config.host} -P ${config.port} -u ${config.username} -e ${`DROP DATABASE IF EXISTS ${database}; CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`}`.env(
    mysqlEnv(config),
  );

  await $`bash -lc ${`gunzip -c "$DUMP_PATH" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$DB_DATABASE"`}`.env({
    ...mysqlEnv(config),
    DUMP_PATH: path,
  });

  if (migrate) {
    if (await commandExists("herd")) await $`herd php artisan migrate --force`.cwd(localDir);
    else await $`php artisan migrate --force`.cwd(localDir);
  }
}

async function importRemote(): Promise<void> {
  if (!sshTarget || !remoteAppDir) usage();

  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
  const outputDump =
    process.env.IMPORT_DB_DUMP_PATH ||
    `${process.env.HOME}/db-dumps/prod-db-${basename(localDir)}-${stamp}.sql.gz`;

  mkdirSync(dirname(outputDump), { recursive: true });
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
  "\${extra_args[@]}" \
  "$DB_NAME" | gzip -c
`;

  console.log(`Remote: ${sshTarget}:${remoteAppDir}`);
  console.log(`Local Laravel project: ${localDir}`);
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
  console.error(`Local Laravel directory not found: ${localDir}`);
  process.exit(1);
}

if (dump) {
  await importDump(resolve(dump));
} else {
  await importRemote();
}
