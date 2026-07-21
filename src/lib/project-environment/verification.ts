import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { log } from "./command";
import { expoEnvironmentValues, laravelEnvironmentValues } from "./environment";
import { readEnv } from "./files";
import { artisan, verifyDatabase, verifyHerd } from "./resources";
import { verifySimulator } from "./simulator";
import { verifySolo } from "./solo";
import type { ExpoEnvironmentOptions, LaravelEnvironmentOptions } from "./environment";
import type { ProjectEnvironmentContext } from "./types";

export function assertEnvironment(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export async function verifyFetch(
  url: string,
  label: string,
  headers: Record<string, string> = {},
  trustedCa?: string,
): Promise<void> {
  log("verify", `fetch ${label}: ${url}`);
  const response = await fetch(url, {
    headers,
    ...(trustedCa ? { tls: { ca: trustedCa } } : {}),
  });
  assertEnvironment(response.ok, `${label} returned HTTP ${response.status}`);
}

export async function waitForFile(path: string, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!existsSync(path)) {
    if (Date.now() >= deadline) {
      throw new Error(`${path} was not created within ${timeoutMs}ms`);
    }
    await Bun.sleep(250);
  }
}

export function verifyEnvironmentFile(path: string, expected: Record<string, string>): void {
  assertEnvironment(existsSync(path), `${path} is missing`);
  const environment = readEnv(path);
  for (const [key, value] of Object.entries(expected)) {
    assertEnvironment(environment[key] === value, `${key} does not belong to this lane`);
  }
}

export function verifyLaneInfrastructure(context: ProjectEnvironmentContext): void {
  assertEnvironment(new URL(context.appUrl).protocol === "https:", "lane APP_URL must use HTTPS");
  assertEnvironment(
    existsSync(context.herdCertificateAuthority),
    `Herd certificate authority is missing at ${context.herdCertificateAuthority}`,
  );
  verifySolo(context);
  verifyHerd(context);
  verifyDatabase(context);
}

export function verifyLaravelEnvironment(
  context: ProjectEnvironmentContext,
  options: LaravelEnvironmentOptions = {},
): void {
  verifyEnvironmentFile(
    resolve(context.backendDir, ".env"),
    laravelEnvironmentValues(context, options),
  );
  artisan(context, "verify", ["about", "--only=environment"]);
  artisan(context, "verify", ["migrate:status"]);
}

export async function verifyViteDevelopmentServer(
  context: ProjectEnvironmentContext,
): Promise<void> {
  const certificateAuthority = readFileSync(context.herdCertificateAuthority, "utf8");
  await verifyFetch(context.appUrl, "Herd HTTPS site", {}, certificateAuthority);

  const hotPath = resolve(context.backendDir, "public/hot");
  await waitForFile(hotPath);
  const appUrl = new URL(context.appUrl);
  const viteOrigin = new URL(readFileSync(hotPath, "utf8").trim());
  assertEnvironment(viteOrigin.protocol === "https:", "Vite hot origin must use HTTPS");
  assertEnvironment(viteOrigin.hostname === appUrl.hostname, "Vite hot origin must use lane host");
  await verifyFetch(
    new URL("/@vite/client", viteOrigin).toString(),
    "Vite client",
    {},
    certificateAuthority,
  );
}

export function verifyExpoEnvironment(
  context: ProjectEnvironmentContext,
  options: ExpoEnvironmentOptions,
): void {
  verifyEnvironmentFile(
    resolve(context.mobileDir, ".env.local"),
    expoEnvironmentValues(context, options),
  );
  verifySimulator(context);
}
