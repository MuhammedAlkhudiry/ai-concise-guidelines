import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

import { log } from "./command";
import { copyIfMissing, readEnv, upsertEnvValues } from "./files";
import type { ProjectEnvironmentContext } from "./types";

export interface LaravelEnvironmentOptions {
  values?: Record<string, string>;
}

export interface ExpoEnvironmentOptions {
  apiUrlKeys: string[];
  metroPortKeys: string[];
  simulatorNameKey: string;
  preserveKeys?: string[];
  values?: Record<string, string>;
}

export function laravelEnvironmentValues(
  context: ProjectEnvironmentContext,
  options: LaravelEnvironmentOptions = {},
): Record<string, string> {
  return {
    APP_URL: context.appUrl,
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_DATABASE: context.database,
    DB_USERNAME: "root",
    DB_PASSWORD: "",
    CACHE_PREFIX: `${context.prefix}_cache`,
    SESSION_COOKIE: context.sessionCookie,
    HORIZON_PREFIX: `${context.prefix}_horizon:`,
    VITE_DEV_SERVER_CERT: context.herdCertificate,
    VITE_DEV_SERVER_KEY: context.herdKey,
    AWS_ACCESS_KEY_ID: "herd",
    AWS_SECRET_ACCESS_KEY: "secretkey",
    AWS_BUCKET: context.bucket,
    AWS_URL: context.assetUrl ?? `http://127.0.0.1:9000/${context.bucket}`,
    AWS_ENDPOINT: "http://127.0.0.1:9000",
    AWS_USE_PATH_STYLE_ENDPOINT: "true",
    ...options.values,
  };
}

export function laravelTestingEnvironmentValues(
  context: ProjectEnvironmentContext,
): Record<string, string> {
  return {
    APP_ENV: "testing",
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_DATABASE: context.testingDatabase,
    DB_USERNAME: "root",
    DB_PASSWORD: "",
  };
}

export function expoEnvironmentValues(
  context: ProjectEnvironmentContext,
  options: ExpoEnvironmentOptions,
): Record<string, string> {
  return {
    ...Object.fromEntries(options.apiUrlKeys.map((key) => [key, context.appUrl])),
    ...Object.fromEntries(options.metroPortKeys.map((key) => [key, context.metroPort])),
    [options.simulatorNameKey]: context.simulatorName,
    ...options.values,
  };
}

function setupEnvironmentFile(
  examplePath: string,
  destinationPath: string,
  values: Record<string, string>,
  preserveKeys: string[] = [],
): void {
  const existing = readEnv(destinationPath);
  if (existsSync(examplePath)) copyIfMissing(examplePath, destinationPath);
  const preserved = Object.fromEntries(
    preserveKeys.flatMap((key) => (key in existing ? [[key, existing[key]]] : [])),
  );
  upsertEnvValues(destinationPath, { ...preserved, ...values });
}

export function setupLaravelEnvironment(
  context: ProjectEnvironmentContext,
  options: LaravelEnvironmentOptions = {},
): void {
  setupEnvironmentFile(
    resolve(context.backendDir, ".env.example"),
    resolve(context.backendDir, ".env"),
    laravelEnvironmentValues(context, options),
  );
  upsertEnvValues(
    resolve(context.backendDir, ".env.testing"),
    laravelTestingEnvironmentValues(context),
  );
  log("backend-env", `configured ${context.backendDir}/.env for ${context.site}`);
  log(
    "testing-env",
    `configured ${context.backendDir}/.env.testing for ${context.testingDatabase}`,
  );
}

export function setupExpoEnvironment(
  context: ProjectEnvironmentContext,
  options: ExpoEnvironmentOptions,
): void {
  setupEnvironmentFile(
    resolve(context.mobileDir, ".env.example"),
    resolve(context.mobileDir, ".env.local"),
    expoEnvironmentValues(context, options),
    options.preserveKeys,
  );
  log("mobile-env", `configured ${context.mobileDir}/.env.local for Metro ${context.metroPort}`);
}

export function removeProjectEnvironmentFiles(context: ProjectEnvironmentContext): void {
  rmSync(resolve(context.backendDir, ".env"), { force: true });
  rmSync(resolve(context.backendDir, ".env.testing"), { force: true });
  rmSync(resolve(context.mobileDir, ".env.local"), { force: true });
}
