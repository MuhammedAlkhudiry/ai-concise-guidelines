import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rename, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

import {
  CREDENTIAL_FILE_ROUTES,
  CREDENTIALS_HOME_ENV,
  CREDENTIALS_ROOT,
} from "../../config/credentials";
import { ensureParentDir } from "./fs";

type CredentialMigrationOptions = {
  home: string;
};

type PlannedCredentialMove = {
  destination: string;
  source: string;
};

export type CredentialMigrationResult = {
  moved: string[];
  updated: string[];
};

export async function migrateManagedCredentials({
  home,
}: CredentialMigrationOptions): Promise<CredentialMigrationResult> {
  const credentialsRoot = join(home, CREDENTIALS_ROOT);
  const destinations = new Map(
    CREDENTIAL_FILE_ROUTES.map((route) => [route.id, join(credentialsRoot, route.destination)]),
  );
  const plannedMoves: PlannedCredentialMove[] = [];
  const duplicateSources: string[] = [];

  for (const route of CREDENTIAL_FILE_ROUTES) {
    const destination = destinations.get(route.id)!;
    const existingSources = route.legacyPaths
      .map((path) => join(home, path))
      .filter((path) => existsSync(path));

    if (existingSources.length > 1) {
      throw new Error(`Multiple legacy credential files found for ${route.id}`);
    }

    const source = existingSources[0];
    if (!source) {
      continue;
    }

    if (!existsSync(destination)) {
      plannedMoves.push({ source, destination });
      continue;
    }

    const [sourceContent, destinationContent] = await Promise.all([
      readFile(source),
      readFile(destination),
    ]);
    if (!sourceContent.equals(destinationContent)) {
      throw new Error(`Credential migration conflict for ${route.id}: both paths contain data`);
    }
    duplicateSources.push(source);
  }

  await ensureCredentialDirectory(credentialsRoot, credentialsRoot);
  const moved: PlannedCredentialMove[] = [];
  const originals = new Map<string, string>();
  const updated: string[] = [];

  try {
    for (const move of plannedMoves) {
      await ensureCredentialDirectory(credentialsRoot, dirname(move.destination));
      await rename(move.source, move.destination);
      await chmod(move.destination, 0o600);
      moved.push(move);
    }

    for (const route of CREDENTIAL_FILE_ROUTES) {
      if (!route.pathRewrites) {
        continue;
      }

      const environmentPath = destinations.get(route.id)!;
      if (!existsSync(environmentPath)) {
        continue;
      }

      let content = await readFile(environmentPath, "utf-8");
      const originalContent = content;

      for (const [variable, targetId] of Object.entries(route.pathRewrites)) {
        const targetRoute = CREDENTIAL_FILE_ROUTES.find((candidate) => candidate.id === targetId);
        if (!targetRoute) {
          throw new Error(`Unknown credential route ${targetId}`);
        }

        const portablePath = `$${CREDENTIALS_HOME_ENV}/${targetRoute.destination}`;
        content = content.replace(
          new RegExp(`^(\\s*export\\s+${variable}=).*$`, "m"),
          `$1"${portablePath}"`,
        );
      }

      if (content !== originalContent) {
        originals.set(environmentPath, originalContent);
        await writePrivateFileAtomically(environmentPath, content);
        updated.push(environmentPath);
      }
    }
  } catch (error) {
    for (const [path, content] of originals) {
      await writePrivateFileAtomically(path, content);
    }
    for (const move of moved.reverse()) {
      if (existsSync(move.destination) && !existsSync(move.source)) {
        await ensureParentDir(move.source);
        await rename(move.destination, move.source);
      }
    }
    throw error;
  }

  for (const destination of destinations.values()) {
    if (existsSync(destination)) {
      await chmod(destination, 0o600);
    }
  }
  for (const source of duplicateSources) {
    await rm(source);
  }

  await removeEmptyLegacyDirectory(join(home, ".credentials"));
  await removeEmptyLegacyDirectory(join(home, ".config/awraq-project"));

  return { moved: moved.map((move) => move.destination), updated };
}

async function ensureCredentialDirectory(root: string, path: string): Promise<void> {
  await mkdir(root, { recursive: true, mode: 0o700 });
  await chmod(root, 0o700);

  const segments = relative(root, path).split("/").filter(Boolean);
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    await mkdir(current, { recursive: true, mode: 0o700 });
    await chmod(current, 0o700);
  }
}

async function writePrivateFileAtomically(path: string, content: string): Promise<void> {
  const temporaryPath = `${path}.tmp-${process.pid}`;
  try {
    await writeFile(temporaryPath, content, { flag: "wx", mode: 0o600 });
    await rename(temporaryPath, path);
    await chmod(path, 0o600);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function removeEmptyLegacyDirectory(path: string): Promise<void> {
  if (!existsSync(path)) {
    return;
  }

  try {
    await rmdir(path);
  } catch {
    // Keep non-empty legacy directories and anything not owned by this migration.
  }
}
