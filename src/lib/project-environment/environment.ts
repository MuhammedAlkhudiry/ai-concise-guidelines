import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, relative, resolve } from "node:path";

import { log } from "./command";
import { readEnv, upsertEnvValues } from "./files";
import type { ProjectEnvironmentContext } from "./types";

export interface LaravelEnvironmentOptions {
  secretKeys?: string[];
  values?: Record<string, string>;
}

export interface ExpoEnvironmentOptions {
  apiUrlKeys: string[];
  metroPortKeys: string[];
  simulatorNameKey: string;
  preserveKeys?: string[];
  secretKeys?: string[];
  values?: Record<string, string>;
}

const TEST_APP_KEY = "base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const MOBILE_ENVIRONMENT_FILENAME = "mobile/.env.local";

function credentialsHome(): string {
  return resolve(
    process.env.SERVICE_CREDENTIALS_HOME ?? resolve(homedir(), ".config/my-setup/credentials"),
  );
}

function managedEnvironmentRoot(context: ProjectEnvironmentContext): string {
  return resolve(credentialsHome(), "project-environments", context.projectId);
}

function managedLaneEnvironmentPath(context: ProjectEnvironmentContext, filename: string): string {
  return resolve(managedEnvironmentRoot(context), context.lane, filename);
}

function pathExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function ensurePrivateDirectory(path: string): void {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  chmodSync(path, 0o700);
}

function ensureManagedLink(linkPath: string, targetPath: string): void {
  ensurePrivateDirectory(dirname(targetPath));
  if (pathExists(linkPath)) {
    const correct =
      lstatSync(linkPath).isSymbolicLink() &&
      resolve(dirname(linkPath), readlinkSync(linkPath)) === targetPath;
    if (correct) return;
    unlinkSync(linkPath);
  }
  symlinkSync(targetPath, linkPath);
}

function migrateDeclaredSecrets(
  context: ProjectEnvironmentContext,
  examplePath: string,
  relativeEnvironmentPath: string,
  secretKeys: string[],
): Record<string, string> {
  if (secretKeys.length === 0) return {};
  const secretsPath = resolve(managedEnvironmentRoot(context), "secrets.env");
  const secrets = readEnv(secretsPath);
  const example = readEnv(examplePath);
  const candidates = [context.root, ...context.registeredLaneRoots]
    .map((root) => resolve(root, relativeEnvironmentPath))
    .filter((path, index, paths) => paths.indexOf(path) === index && pathExists(path));

  for (const key of secretKeys) {
    if (secrets[key]) continue;
    const values = new Set(
      candidates
        .map((path) => readEnv(path)[key])
        .filter((value): value is string => Boolean(value) && value !== example[key]),
    );
    if (values.size > 1) {
      throw new Error(`Conflicting legacy values found for ${context.projectId} ${key}`);
    }
    const [value] = values;
    if (value) secrets[key] = value;
  }

  if (Object.keys(secrets).length > 0) {
    ensurePrivateDirectory(dirname(secretsPath));
    if (!existsSync(secretsPath)) writeFileSync(secretsPath, "", { mode: 0o600 });
    upsertEnvValues(secretsPath, secrets);
    chmodSync(secretsPath, 0o600);
  }
  return Object.fromEntries(
    secretKeys.flatMap((key) => (secrets[key] ? [[key, secrets[key]]] : [])),
  );
}

export function laravelEnvironmentValues(
  context: ProjectEnvironmentContext,
  options: LaravelEnvironmentOptions = {},
): Record<string, string> {
  const vitePort = context.vitePort ?? String(5173 + context.laneNumber);
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
    VITE_PORT: vitePort,
    VITE_DEV_SERVER_ORIGIN: `${context.appUrl}:${vitePort}`,
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
    APP_KEY: TEST_APP_KEY,
    DB_CONNECTION: "mysql",
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_DATABASE: context.testingDatabase,
    DB_USERNAME: "root",
    DB_PASSWORD: "",
    ...(context.agentDatabase ? { AGENT_DATABASE: context.agentDatabase } : {}),
    ...(context.mutationDatabase ? { MUTATION_DATABASE: context.mutationDatabase } : {}),
    CACHE_STORE: "array",
    FILESYSTEM_DISK: "local",
    MAIL_MAILER: "array",
    QUEUE_CONNECTION: "sync",
    SESSION_DRIVER: "array",
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
  context: ProjectEnvironmentContext,
  examplePath: string,
  linkPath: string,
  targetPath: string,
  values: Record<string, string>,
  preserveKeys: string[] = [],
  secretKeys: string[] = [],
): void {
  const existing = readEnv(linkPath);
  if (!existsSync(targetPath)) {
    ensurePrivateDirectory(dirname(targetPath));
    if (existsSync(examplePath)) copyFileSync(examplePath, targetPath);
    else writeFileSync(targetPath, "", { mode: 0o600 });
    upsertEnvValues(targetPath, existing);
  }
  const relativeEnvironmentPath = relative(context.root, linkPath);
  const secrets = migrateDeclaredSecrets(context, examplePath, relativeEnvironmentPath, secretKeys);
  const preserved = Object.fromEntries(
    preserveKeys.flatMap((key) => (key in existing ? [[key, existing[key]]] : [])),
  );
  upsertEnvValues(targetPath, { ...preserved, ...secrets, ...values });
  chmodSync(targetPath, 0o600);
  ensureManagedLink(linkPath, targetPath);
}

export function setupLaravelEnvironment(
  context: ProjectEnvironmentContext,
  options: LaravelEnvironmentOptions = {},
): void {
  setupEnvironmentFile(
    context,
    resolve(context.backendDir, ".env.example"),
    resolve(context.backendDir, ".env"),
    managedLaneEnvironmentPath(context, "backend.env"),
    laravelEnvironmentValues(context, options),
    [],
    options.secretKeys,
  );
  setupEnvironmentFile(
    context,
    resolve(context.backendDir, ".env.testing.example"),
    resolve(context.backendDir, ".env.testing"),
    managedLaneEnvironmentPath(context, "backend.testing.env"),
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
    context,
    resolve(context.mobileDir, ".env.example"),
    resolve(context.mobileDir, ".env.local"),
    managedLaneEnvironmentPath(context, MOBILE_ENVIRONMENT_FILENAME),
    expoEnvironmentValues(context, options),
    options.preserveKeys,
    options.secretKeys,
  );
  log("mobile-env", `configured ${context.mobileDir}/.env.local for Metro ${context.metroPort}`);
}

function verifyManagedLink(
  context: ProjectEnvironmentContext,
  linkPath: string,
  filename: string,
): void {
  const targetPath = managedLaneEnvironmentPath(context, filename);
  if (!pathExists(linkPath) || !lstatSync(linkPath).isSymbolicLink()) {
    throw new Error(`${linkPath} is not managed by lanes; run lanes repair`);
  }
  if (resolve(dirname(linkPath), readlinkSync(linkPath)) !== targetPath) {
    throw new Error(`${linkPath} points outside the lane environment store; run lanes repair`);
  }
}

export function verifyManagedLaravelEnvironment(context: ProjectEnvironmentContext): void {
  verifyManagedLink(context, resolve(context.backendDir, ".env"), "backend.env");
  verifyManagedLink(context, resolve(context.backendDir, ".env.testing"), "backend.testing.env");
}

export function verifyManagedExpoEnvironment(context: ProjectEnvironmentContext): void {
  verifyManagedLink(context, resolve(context.mobileDir, ".env.local"), MOBILE_ENVIRONMENT_FILENAME);
}

export function removeProjectEnvironmentFiles(context: ProjectEnvironmentContext): void {
  rmSync(resolve(context.backendDir, ".env"), { force: true });
  rmSync(resolve(context.backendDir, ".env.testing"), { force: true });
  rmSync(resolve(context.mobileDir, ".env.local"), { force: true });
  rmSync(resolve(managedEnvironmentRoot(context), context.lane), {
    recursive: true,
    force: true,
  });
}
