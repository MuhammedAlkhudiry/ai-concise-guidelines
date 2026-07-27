import { homedir } from "node:os";
import { resolve } from "node:path";

import type { ProjectEnvironmentContext, ProjectEnvironmentDefinition } from "./types";

function commaSeparatedEnvironmentValue(name: string): string[] {
  const value = process.env[name];
  return value ? value.split(",").filter(Boolean) : [];
}

export function createProjectEnvironmentContext(
  definition: ProjectEnvironmentDefinition,
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
  if (!lane || !Number.isSafeInteger(laneNumber) || laneNumber < 1) {
    throw new Error("PROJECT_LANE_ID and a positive PROJECT_LANE_NUMBER are required");
  }
  if (lane !== `lane-${laneNumber}`) {
    throw new Error(`Lane identity mismatch: ${lane} does not match lane number ${laneNumber}`);
  }
  const site = `${definition.id}-${lane}`;
  const prefix = site.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
  const bucket = site;
  const herdBin =
    process.env.HERD_BIN ?? resolve(homedir(), "Library/Application Support/Herd/bin");
  const herdConfig = resolve(herdBin, "../config/valet");

  return {
    root,
    backendDir: resolve(root, definition.backendDirectory),
    mobileDir: resolve(root, definition.mobileDirectory),
    lane,
    laneNumber,
    site,
    appUrl: `https://${site}.test`,
    database: prefix,
    testingDatabase: `${prefix}_testing`,
    prefix,
    sessionCookie: `${prefix}_session`,
    bucket,
    assetUrl: definition.assetUrl?.(bucket),
    metroPort: String(definition.metroPortBase + laneNumber),
    simulatorName: `${definition.name} Lane ${laneNumber}`,
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
