import { afterEach, describe, expect, test } from "bun:test";
import {
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import {
  expoEnvironmentValues,
  laravelEnvironmentValues,
  laravelTestingEnvironmentValues,
  removeProjectEnvironmentFiles,
  setupExpoEnvironment,
  setupLaravelEnvironment,
} from "./environment";
import { readEnv } from "./files";
import type { ProjectEnvironmentContext } from "./types";

const temporaryDirectories: string[] = [];
const originalCredentialsHome = process.env.SERVICE_CREDENTIALS_HOME;

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true });
  if (originalCredentialsHome === undefined) delete process.env.SERVICE_CREDENTIALS_HOME;
  else process.env.SERVICE_CREDENTIALS_HOME = originalCredentialsHome;
});

function context(root: string): ProjectEnvironmentContext {
  return {
    projectId: "example",
    root,
    backendDir: resolve(root, "backend"),
    mobileDir: resolve(root, "mobile"),
    lane: "lane-3",
    laneNumber: 3,
    site: "example-lane-3",
    appUrl: "https://example-lane-3.test",
    database: "example_lane_3",
    testingDatabase: "example_lane_3_testing",
    agentDatabase: "example_lane_3_agent",
    mutationDatabase: "example_lane_3_mutation",
    prefix: "example_lane_3",
    sessionCookie: "example_lane_3_session",
    bucket: "example-lane-3",
    metroPort: "7003",
    simulatorName: "Example Lane 3",
    herdCertificate: "/herd/Certificates/example-lane-3.test.crt",
    herdKey: "/herd/Certificates/example-lane-3.test.key",
    registeredLaneRoots: [root],
  } as ProjectEnvironmentContext;
}

function useTemporaryCredentialsHome(root: string): string {
  const credentials = resolve(root, "credentials");
  process.env.SERVICE_CREDENTIALS_HOME = credentials;
  return credentials;
}

describe("project environment files", () => {
  test("builds conventional Laravel lane values with project overrides", () => {
    const values = laravelEnvironmentValues(context("/project"), {
      values: { CACHE_PREFIX: "custom_cache", PROJECT_VALUE: "yes" },
    });

    expect(values).toMatchObject({
      APP_URL: "https://example-lane-3.test",
      DB_DATABASE: "example_lane_3",
      VITE_DEV_SERVER_CERT: "/herd/Certificates/example-lane-3.test.crt",
      VITE_DEV_SERVER_KEY: "/herd/Certificates/example-lane-3.test.key",
      AWS_BUCKET: "example-lane-3",
      CACHE_PREFIX: "custom_cache",
      PROJECT_VALUE: "yes",
    });
  });

  test("writes and removes a lane-owned Laravel testing environment", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-"));
    temporaryDirectories.push(root);
    const project = context(root);
    const credentials = useTemporaryCredentialsHome(root);
    mkdirSync(project.backendDir, { recursive: true });
    mkdirSync(project.mobileDir, { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "APP_NAME=Example\n");

    setupLaravelEnvironment(project);

    expect(laravelTestingEnvironmentValues(project)).toMatchObject({
      APP_ENV: "testing",
      DB_DATABASE: "example_lane_3_testing",
      AGENT_DATABASE: "example_lane_3_agent",
      MUTATION_DATABASE: "example_lane_3_mutation",
    });
    expect(readFileSync(resolve(project.backendDir, ".env.testing"), "utf8")).toContain(
      "DB_DATABASE=example_lane_3_testing",
    );
    expect(lstatSync(resolve(project.backendDir, ".env")).isSymbolicLink()).toBeTrue();
    expect(readlinkSync(resolve(project.backendDir, ".env"))).toBe(
      resolve(credentials, "project-environments/example/lane-3/backend.env"),
    );
    expect(statSync(resolve(project.backendDir, ".env")).mode & 0o777).toBe(0o600);

    removeProjectEnvironmentFiles(project);

    expect(() => readFileSync(resolve(project.backendDir, ".env.testing"), "utf8")).toThrow();
  });

  test("omits undeclared optional database roles from Laravel testing values", () => {
    const project = context("/project");
    delete project.agentDatabase;
    delete project.mutationDatabase;

    const values = laravelTestingEnvironmentValues(project);

    expect(values).not.toHaveProperty("AGENT_DATABASE");
    expect(values).not.toHaveProperty("MUTATION_DATABASE");
  });

  test("quotes and reads Herd paths containing spaces", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project environment "));
    temporaryDirectories.push(root);
    const project = context(root);
    useTemporaryCredentialsHome(root);
    project.herdCertificate = "/Application Support/Herd/example.crt";
    project.herdKey = "/Application Support/Herd/example.key";
    mkdirSync(project.backendDir, { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "APP_NAME=Example\n");

    setupLaravelEnvironment(project);

    const contents = readFileSync(resolve(project.backendDir, ".env"), "utf8");
    expect(contents).toContain('VITE_DEV_SERVER_CERT="/Application Support/Herd/example.crt"');
    expect(contents).toContain('VITE_DEV_SERVER_KEY="/Application Support/Herd/example.key"');
  });

  test("maps Expo keys and preserves selected local credentials", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-"));
    temporaryDirectories.push(root);
    const project = context(root);
    const credentials = useTemporaryCredentialsHome(root);
    mkdirSync(project.mobileDir, { recursive: true });
    writeFileSync(
      resolve(project.mobileDir, ".env.local"),
      "EXPO_PUBLIC_GOOGLE_CLIENT_ID=local-client\nOLD_VALUE=remove-me\n",
    );
    const options = {
      apiUrlKeys: ["EXPO_PUBLIC_APP_URL", "EXPO_PUBLIC_IOS_APP_URL"],
      metroPortKeys: ["EXPO_DEV_SERVER_PORT"],
      simulatorNameKey: "EXPO_IOS_SIMULATOR",
      preserveKeys: ["EXPO_PUBLIC_GOOGLE_CLIENT_ID"],
    };

    setupExpoEnvironment(project, options);

    expect(expoEnvironmentValues(project, options)).toEqual({
      EXPO_PUBLIC_APP_URL: "https://example-lane-3.test",
      EXPO_PUBLIC_IOS_APP_URL: "https://example-lane-3.test",
      EXPO_DEV_SERVER_PORT: "7003",
      EXPO_IOS_SIMULATOR: "Example Lane 3",
    });
    expect(readFileSync(resolve(project.mobileDir, ".env.local"), "utf8")).toContain(
      "EXPO_PUBLIC_GOOGLE_CLIENT_ID=local-client",
    );
    expect(readlinkSync(resolve(project.mobileDir, ".env.local"))).toBe(
      resolve(credentials, "project-environments/example/lane-3/mobile/.env.local"),
    );
  });

  test("migrates one declared project secret without printing it into setup code", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-secret-"));
    temporaryDirectories.push(root);
    const credentials = useTemporaryCredentialsHome(root);
    const project = context(root);
    mkdirSync(project.backendDir, { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "OPENAI_API_KEY=\n");
    const expected = 'abc#def $value "quote" \\ path\nnext';
    writeFileSync(
      resolve(project.backendDir, ".env"),
      'OPENAI_API_KEY="abc#def \\$value \\"quote\\" \\\\ path\\nnext"\n',
    );

    setupLaravelEnvironment(project, { secretKeys: ["OPENAI_API_KEY"] });

    const secretsPath = resolve(credentials, "project-environments/example/secrets.env");
    expect(readEnv(secretsPath).OPENAI_API_KEY).toBe(expected);
    expect(statSync(secretsPath).mode & 0o777).toBe(0o600);
    expect(readEnv(resolve(project.backendDir, ".env")).OPENAI_API_KEY).toBe(expected);
  });

  test("migrates a unique declared secret from another registered lane", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-registered-secret-"));
    temporaryDirectories.push(root);
    const currentRoot = resolve(root, "lane-3");
    const legacyRoot = resolve(root, "lane-2");
    const credentials = useTemporaryCredentialsHome(root);
    const project = context(currentRoot);
    project.registeredLaneRoots = [currentRoot, legacyRoot];
    mkdirSync(project.backendDir, { recursive: true });
    mkdirSync(resolve(legacyRoot, "backend"), { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "OPENAI_API_KEY=\n");
    writeFileSync(resolve(legacyRoot, "backend/.env"), "OPENAI_API_KEY=legacy-secret\n");

    setupLaravelEnvironment(project, { secretKeys: ["OPENAI_API_KEY"] });

    expect(
      readFileSync(resolve(credentials, "project-environments/example/secrets.env"), "utf8"),
    ).toContain("OPENAI_API_KEY=legacy-secret");
    expect(readFileSync(resolve(project.backendDir, ".env"), "utf8")).toContain(
      "OPENAI_API_KEY=legacy-secret",
    );
  });

  test("refuses to choose between conflicting registered-lane secrets", () => {
    const root = mkdtempSync(resolve(tmpdir(), "project-environment-conflicting-secret-"));
    temporaryDirectories.push(root);
    const currentRoot = resolve(root, "lane-3");
    const otherRoot = resolve(root, "lane-2");
    useTemporaryCredentialsHome(root);
    const project = context(currentRoot);
    project.registeredLaneRoots = [currentRoot, otherRoot];
    mkdirSync(project.backendDir, { recursive: true });
    mkdirSync(resolve(otherRoot, "backend"), { recursive: true });
    writeFileSync(resolve(project.backendDir, ".env.example"), "OPENAI_API_KEY=\n");
    writeFileSync(resolve(project.backendDir, ".env"), "OPENAI_API_KEY=current-secret\n");
    writeFileSync(resolve(otherRoot, "backend/.env"), "OPENAI_API_KEY=other-secret\n");

    expect(() => setupLaravelEnvironment(project, { secretKeys: ["OPENAI_API_KEY"] })).toThrow(
      "Conflicting legacy values found for example OPENAI_API_KEY",
    );
  });
});
