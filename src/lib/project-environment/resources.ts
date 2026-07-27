import { existsSync, readFileSync, readlinkSync, symlinkSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

import { output, run } from "./command";
import type { ProjectEnvironmentContext } from "./types";

export function artisan(context: ProjectEnvironmentContext, step: string, args: string[]): void {
  run(context, step, context.phpCommand, [...context.phpArgsPrefix, "artisan", ...args], {
    cwd: context.backendDir,
  });
}

export function artisanOutput(
  context: ProjectEnvironmentContext,
  step: string,
  args: string[],
): string {
  return output(context, step, context.phpCommand, [...context.phpArgsPrefix, "artisan", ...args], {
    cwd: context.backendDir,
  });
}

export function ensureLaravelAppKey(context: ProjectEnvironmentContext): void {
  const envPath = resolve(context.backendDir, ".env");
  if (!/^APP_KEY=base64:.+/m.test(readFileSync(envPath, "utf8"))) {
    artisan(context, "app-key", ["key:generate", "--force"]);
  }
}

export function reindexLaravelScoutModels(context: ProjectEnvironmentContext): void {
  const script = [
    "config(['scout.queue' => false]);",
    "$models = collect(Illuminate\\Support\\Facades\\File::allFiles(app_path('Models')))",
    "    ->map(function ($file) {",
    "        $relative = str_replace(DIRECTORY_SEPARATOR, '\\\\', $file->getRelativePath());",
    "        return app()->getNamespace().'Models\\\\'.($relative ? $relative.'\\\\' : '').$file->getFilenameWithoutExtension();",
    "    })",
    "    ->filter(fn ($model) => class_exists($model)",
    "        && is_subclass_of($model, Illuminate\\Database\\Eloquent\\Model::class)",
    "        && ! (new ReflectionClass($model))->isAbstract()",
    "        && in_array(Laravel\\Scout\\Searchable::class, class_uses_recursive($model), true));",
    "foreach ($models as $model) {",
    '    echo "Importing {$model}\\n";',
    "    $model::makeAllSearchable();",
    "}",
  ].join("\n");
  artisan(context, "search", ["tinker", "--execute", script]);
}

export function deleteLaravelS3Bucket(
  context: ProjectEnvironmentContext,
  options: { allowFailure?: boolean } = {},
): void {
  run(
    context,
    "clean:storage",
    context.phpCommand,
    [
      ...context.phpArgsPrefix,
      "artisan",
      "tinker",
      "--execute",
      "$disk = Storage::disk('s3'); foreach ($disk->allFiles() as $file) { $disk->delete($file); } try { $disk->getClient()->deleteBucket(['Bucket' => config('filesystems.disks.s3.bucket')]); } catch (Throwable $exception) { report($exception); }",
    ],
    { cwd: context.backendDir, allowFailure: options.allowFailure },
  );
}

export function trustMise(context: ProjectEnvironmentContext): void {
  if (!existsSync(resolve(context.root, "mise.toml"))) return;
  run(context, "mise", "mise", ["trust", context.root], { cwd: context.root });
}

export function setupHerd(context: ProjectEnvironmentContext): void {
  run(context, "herd", context.herdCommand, ["unlink", context.site], {
    cwd: context.backendDir,
    allowFailure: true,
  });
  run(context, "herd", context.herdCommand, ["link", context.site], { cwd: context.backendDir });
  const sitePath = herdSitePath(context);
  const target = resolve(dirname(sitePath), readlinkSync(sitePath));
  if (target !== context.backendDir) {
    unlinkSync(sitePath);
    symlinkSync(context.backendDir, sitePath, "dir");
  }
  run(context, "herd", context.herdCommand, ["secure", context.site, "--no-interaction"], {
    cwd: context.backendDir,
  });
  verifyHerdCertificateFiles(context);
  run(
    context,
    "herd",
    context.herdCommand,
    ["isolate", context.phpVersion, `--site=${context.site}`],
    { cwd: context.backendDir },
  );
}

export function verifyHerd(context: ProjectEnvironmentContext): void {
  const sites = output(context, "verify:herd", context.herdCommand, ["sites"], {
    cwd: context.root,
  });
  if (!sites.includes(context.site)) throw new Error(`Herd site ${context.site} is missing`);

  const sitePath = herdSitePath(context);
  const target = resolve(dirname(sitePath), readlinkSync(sitePath));
  if (target !== context.backendDir) {
    throw new Error(`Herd site ${context.site} points to ${target}, not ${context.backendDir}`);
  }
  verifyHerdCertificateFiles(context);
}

function verifyHerdCertificateFiles(context: ProjectEnvironmentContext): void {
  if (!existsSync(context.herdCertificate)) {
    throw new Error(`Herd certificate ${context.herdCertificate} is missing`);
  }
  if (!existsSync(context.herdKey)) {
    throw new Error(`Herd key ${context.herdKey} is missing`);
  }
}

function herdSitePath(context: ProjectEnvironmentContext): string {
  return resolve(homedir(), "Library/Application Support/Herd/config/valet/Sites", context.site);
}

export function cleanHerd(context: ProjectEnvironmentContext): void {
  run(context, "clean:herd", context.herdCommand, ["unsecure", context.site, "--no-interaction"], {
    cwd: context.backendDir,
    allowFailure: true,
  });
  run(context, "clean:herd", context.herdCommand, ["unlink", context.site], {
    cwd: context.backendDir,
    allowFailure: true,
  });
  for (const path of [
    context.herdCertificate,
    context.herdKey,
    context.herdCertificate.replace(/\.crt$/, ".csr"),
    context.herdCertificate.replace(/\.crt$/, ".conf"),
  ]) {
    if (existsSync(path)) unlinkSync(path);
  }
}

function databaseIdentifier(database: string): string {
  if (!/^[a-z0-9_]+$/.test(database)) throw new Error("Unsafe database name");
  return database;
}

function createDatabase(context: ProjectEnvironmentContext, database: string): void {
  const identifier = databaseIdentifier(database);
  run(
    context,
    "database",
    context.mysqlCommand,
    [
      "-h127.0.0.1",
      "-uroot",
      "-e",
      `CREATE DATABASE IF NOT EXISTS \`${identifier}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    ],
    { cwd: context.root },
  );
}

export function setupDatabase(context: ProjectEnvironmentContext): void {
  createDatabase(context, context.database);
  createDatabase(context, context.testingDatabase);
}

export function verifyDatabase(context: ProjectEnvironmentContext): void {
  const databases = [context.database, context.testingDatabase].map(databaseIdentifier);
  const value = output(
    context,
    "verify:database",
    context.mysqlCommand,
    [
      "-h127.0.0.1",
      "-uroot",
      "-Nse",
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME IN ('${databases.join("','")}') ORDER BY SCHEMA_NAME`,
    ],
    { cwd: context.root },
  );
  const existing = new Set(value.trim().split(/\s+/).filter(Boolean));
  for (const database of databases) {
    if (!existing.has(database)) throw new Error(`Database ${database} is missing`);
  }
}

function dropDatabase(context: ProjectEnvironmentContext, database: string): void {
  const identifier = databaseIdentifier(database);
  run(
    context,
    "clean:database",
    context.mysqlCommand,
    ["-h127.0.0.1", "-uroot", "-e", `DROP DATABASE IF EXISTS \`${identifier}\``],
    { cwd: context.root },
  );
}

export function cleanTestingDatabases(context: ProjectEnvironmentContext): void {
  const testingDatabase = databaseIdentifier(context.testingDatabase);
  const parallelPrefix = `${testingDatabase}_test_`;
  const value = output(
    context,
    "clean:testing-databases",
    context.mysqlCommand,
    [
      "-h127.0.0.1",
      "-uroot",
      "-Nse",
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${testingDatabase}' OR LEFT(SCHEMA_NAME, ${parallelPrefix.length})='${parallelPrefix}' ORDER BY SCHEMA_NAME`,
    ],
    { cwd: context.root },
  );
  for (const database of value.trim().split(/\s+/).filter(Boolean)) {
    if (database !== testingDatabase && !database.startsWith(parallelPrefix)) {
      throw new Error(`Database ${database} does not belong to ${context.lane}`);
    }
    dropDatabase(context, database);
  }
}

export function cleanDatabase(context: ProjectEnvironmentContext): void {
  cleanTestingDatabases(context);
  dropDatabase(context, context.database);
}
