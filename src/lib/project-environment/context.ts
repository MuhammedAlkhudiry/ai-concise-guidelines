import { homedir } from "node:os";
import { resolve } from "node:path";

import type {
  ProjectDatabaseRole,
  ProjectEnvironmentContext,
  ProjectEnvironmentDefinition,
} from "./types";

function commaSeparatedEnvironmentValue(name: string): string[] {
  const value = process.env[name];
  return value ? value.split(",").filter(Boolean) : [];
}

function registeredLaneRoots(): string[] {
  const value = process.env.PROJECT_LANE_REGISTERED_ROOTS;
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((path) => typeof path === "string")) {
    throw new Error("PROJECT_LANE_REGISTERED_ROOTS must be a JSON array of paths");
  }
  return parsed.map((path) => resolve(path));
}

export function createProjectEnvironmentContext(
  definition: ProjectEnvironmentDefinition,
  databaseRoles: readonly ProjectDatabaseRole[] = [],
): ProjectEnvironmentContext {
  const definitionRoot = process.env.PROJECT_LANE_DEFINITION_ROOT;
  const configuredRoot = process.env[definition.rootEnvironmentVariable];
  if (definitionRoot && configuredRoot && resolve(definitionRoot) !== resolve(configuredRoot)) {
    throw new Error(
      `Lane root mismatch: PROJECT_LANE_DEFINITION_ROOT=${definitionRoot}, ${definition.rootEnvironmentVariable}=${configuredRoot}`,
    );
  }
  const root = resolve(definitionRoot ?? configuredRoot ?? definition.defaultRoot);
  const lane = process.env.PROJECT_LANE_ID;
  const laneNumber = Number(process.env.PROJECT_LANE_NUMBER);
  const isCanonical = lane === "main" && laneNumber === 0;
  const isTaskLane =
    Boolean(lane?.match(/^[a-z0-9][a-z0-9-]*$/)) &&
    lane !== "main" &&
    Number.isSafeInteger(laneNumber) &&
    laneNumber > 0;
  if (!isCanonical && !isTaskLane) {
    throw new Error(`Invalid environment identity and slot: ${lane}/${laneNumber}`);
  }
  const environmentId = lane!;
  const site = `${definition.id}-${environmentId}`;
  const prefix = site.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
  const bucket = site;
  const herdBin =
    process.env.HERD_BIN ?? resolve(homedir(), "Library/Application Support/Herd/bin");
  const herdConfig = resolve(herdBin, "../config/valet");

  const optionalDatabases = {
    ...(databaseRoles.includes("agent") ? { agentDatabase: `${prefix}_agent` } : {}),
    ...(databaseRoles.includes("mutation") ? { mutationDatabase: `${prefix}_mutation` } : {}),
  };

  return {
    projectId: definition.id,
    root,
    backendDir: resolve(root, definition.backendDirectory),
    mobileDir: resolve(root, definition.mobileDirectory),
    lane: environmentId,
    laneNumber,
    site,
    appUrl: `https://${site}.test`,
    database: prefix,
    testingDatabase: `${prefix}_testing`,
    ...optionalDatabases,
    prefix,
    sessionCookie: `${prefix}_session`,
    bucket,
    assetUrl: definition.assetUrl?.(bucket),
    metroPort: String(definition.metroPortBase + laneNumber),
    vitePort: String((definition.vitePortBase ?? 5173) + laneNumber),
    simulatorName: isCanonical ? `${definition.name} Main` : `${definition.name} ${environmentId}`,
    herdBin,
    herdCertificateAuthority: resolve(herdConfig, "CA/LaravelValetCASelfSigned.pem"),
    herdCertificate: resolve(herdConfig, `Certificates/${site}.test.crt`),
    herdKey: resolve(herdConfig, `Certificates/${site}.test.key`),
    herdCommand: process.env.HERD_COMMAND ?? resolve(herdBin, "herd"),
    phpCommand: process.env.PHP_BIN ?? resolve(herdBin, "herd"),
    phpArgsPrefix: process.env.PHP_BIN ? [] : ["php"],
    composerCommand: process.env.COMPOSER_BIN ?? resolve(herdBin, "herd"),
    composerArgsPrefix: process.env.COMPOSER_BIN ? [] : ["composer"],
    mysqlCommand: process.env.MYSQL_BIN ?? resolve(herdBin, "mysql"),
    phpVersion: definition.phpVersion ?? "8.4",
    registeredLaneRoots: registeredLaneRoots(),
    simulatorSlimming:
      process.env.PROJECT_LANE_SIMSLIM_ENABLED === "1"
        ? {
            exceptCategories: commaSeparatedEnvironmentValue(
              "PROJECT_LANE_SIMSLIM_EXCEPT_CATEGORIES",
            ),
            keepServices: commaSeparatedEnvironmentValue("PROJECT_LANE_SIMSLIM_KEEP_SERVICES"),
          }
        : undefined,
  };
}
