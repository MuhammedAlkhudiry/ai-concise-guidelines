#!/usr/bin/env bun

import { createHash, randomBytes } from "node:crypto";
import { chmod, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { CREDENTIALS_HOME_ENV } from "../../config/credentials";

const clientId = requiredEnv("GOOGLE_ADS_CLIENT_ID");
const clientSecret = requiredEnv("GOOGLE_ADS_CLIENT_SECRET");
const secretsFile = resolve(process.argv[2] ?? `${requiredEnv(CREDENTIALS_HOME_ENV)}/secrets.zsh`);
const state = randomBytes(24).toString("base64url");
const codeVerifier = randomBytes(48).toString("base64url");
const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

let resolveCallback!: (value: URL) => void;
let rejectCallback!: (reason: Error) => void;
const callback = new Promise<URL>((resolvePromise, rejectPromise) => {
  resolveCallback = resolvePromise;
  rejectCallback = rejectPromise;
});

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== "/oauth/callback") {
      return new Response("Not found", { status: 404 });
    }
    if (url.searchParams.get("state") !== state) {
      rejectCallback(new Error("OAuth state verification failed."));
      return new Response("Authorization failed: invalid state.", { status: 400 });
    }
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      rejectCallback(new Error(`Google authorization failed: ${oauthError}`));
      return new Response("Authorization was not completed.", { status: 400 });
    }
    resolveCallback(url);
    return new Response("Google Ads authorization completed. You can close this tab.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
});

const redirectUri = `http://127.0.0.1:${server.port}/oauth/callback`;
const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorizationUrl.search = new URLSearchParams({
  access_type: "offline",
  client_id: clientId,
  code_challenge: codeChallenge,
  code_challenge_method: "S256",
  include_granted_scopes: "true",
  prompt: "consent",
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/adwords",
  state,
}).toString();

console.log(`Authorize Google Ads access:\n${authorizationUrl.toString()}`);

const timeout = setTimeout(
  () => {
    rejectCallback(new Error("Authorization timed out after fifteen minutes."));
  },
  15 * 60 * 1000,
);

try {
  const callbackUrl = await callback;
  const code = callbackUrl.searchParams.get("code");
  if (!code) throw new Error("Google did not return an authorization code.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const body = (await response.json()) as {
    error?: string;
    error_description?: string;
    refresh_token?: string;
  };

  if (!response.ok || !body.refresh_token) {
    throw new Error(
      `Token exchange failed (${response.status}): ${body.error ?? "missing_refresh_token"}${body.error_description ? ` - ${body.error_description}` : ""}`,
    );
  }

  await updateRefreshToken(secretsFile, body.refresh_token);
  console.log(JSON.stringify({ ok: true, secretsFile, refreshTokenUpdated: true }));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: errorMessage(error) }));
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
  server.stop(true);
}

async function updateRefreshToken(path: string, refreshToken: string): Promise<void> {
  const source = await readFile(path, "utf8");
  const line = `export GOOGLE_ADS_REFRESH_TOKEN=${JSON.stringify(refreshToken)}`;
  const pattern = /^export GOOGLE_ADS_REFRESH_TOKEN=.*$/m;
  const updated = pattern.test(source)
    ? source.replace(pattern, line)
    : `${source.trimEnd()}\n${line}\n`;
  await writeFile(path, updated, { mode: 0o600 });
  await chmod(path, 0o600);
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}.`);
  return value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
