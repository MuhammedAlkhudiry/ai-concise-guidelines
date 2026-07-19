import { existsSync, readlinkSync, symlinkSync, unlinkSync } from "node:fs";
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
  const certificateRoot = resolve(
    homedir(),
    "Library/Application Support/Herd/config/valet/Certificates",
  );
  for (const extension of ["crt", "key", "csr", "conf"]) {
    const path = resolve(certificateRoot, `${context.site}.test.${extension}`);
    if (existsSync(path)) unlinkSync(path);
  }
}

function databaseIdentifier(context: ProjectEnvironmentContext): string {
  if (!/^[a-z0-9_]+$/.test(context.database)) throw new Error("Unsafe database name");
  return context.database;
}

export function setupDatabase(context: ProjectEnvironmentContext): void {
  run(
    context,
    "database",
    context.mysqlCommand,
    [
      "-h127.0.0.1",
      "-uroot",
      "-e",
      `CREATE DATABASE IF NOT EXISTS \`${databaseIdentifier(context)}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    ],
    { cwd: context.root },
  );
}

export function verifyDatabase(context: ProjectEnvironmentContext): void {
  const value = output(
    context,
    "verify:database",
    context.mysqlCommand,
    [
      "-h127.0.0.1",
      "-uroot",
      "-Nse",
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${databaseIdentifier(context)}'`,
    ],
    { cwd: context.root },
  );
  if (value.trim() !== context.database) throw new Error(`Database ${context.database} is missing`);
}

export function cleanDatabase(context: ProjectEnvironmentContext): void {
  run(
    context,
    "clean:database",
    context.mysqlCommand,
    ["-h127.0.0.1", "-uroot", "-e", `DROP DATABASE IF EXISTS \`${databaseIdentifier(context)}\``],
    { cwd: context.root },
  );
}
