import { homedir } from "node:os";
import { basename, resolve } from "node:path";

import type { ProjectEnvironmentContext, ProjectEnvironmentDefinition } from "./types";

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
  const match = /(?:^|-)lane-(\d+)$/.exec(basename(root));
  if (!match) throw new Error(`${root} is not a configured lane path`);

  const laneNumber = Number(match[1]);
  const lane = `lane-${laneNumber}`;
  const site = `${definition.id}-${lane}`;
  const prefix = site.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
  const bucket = site;
  const herdBin =
    process.env.HERD_BIN ?? resolve(homedir(), "Library/Application Support/Herd/bin");

  return {
    root,
    backendDir: resolve(root, definition.backendDirectory),
    mobileDir: resolve(root, definition.mobileDirectory),
    lane,
    laneNumber,
    site,
    appUrl: `https://${site}.test`,
    database: prefix,
    prefix,
    sessionCookie: `${prefix}_session`,
    bucket,
    assetUrl: definition.assetUrl?.(bucket),
    metroPort: String(definition.metroPortBase + laneNumber),
    simulatorName: `${definition.name} Lane ${laneNumber}`,
    soloProjectName: site,
    herdBin,
    herdCommand: process.env.HERD_COMMAND ?? resolve(herdBin, "herd"),
    phpCommand: process.env.PHP_BIN ?? resolve(herdBin, "herd"),
    phpArgsPrefix: process.env.PHP_BIN ? [] : ["php"],
    composerCommand: process.env.COMPOSER_BIN ?? resolve(herdBin, "herd"),
    composerArgsPrefix: process.env.COMPOSER_BIN ? [] : ["composer"],
    mysqlCommand: process.env.MYSQL_BIN ?? resolve(herdBin, "mysql"),
    phpVersion: definition.phpVersion ?? "8.4",
  };
}
