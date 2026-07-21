import { isAbsolute, relative, resolve } from "node:path";

import { ensureMarkedInstall } from "./files";
import type { ProjectEnvironmentContext } from "./types";

interface ComposerDependenciesOptions {
  installArgs?: string[];
}

interface BunDependenciesOptions {
  directory: string;
  label?: string;
  step?: string;
  installArgs?: string[];
}

function projectRelativeDirectory(context: ProjectEnvironmentContext, directory: string): string {
  const path = relative(context.root, resolve(context.root, directory));
  if (path.startsWith("..") || isAbsolute(path)) {
    throw new Error(`Dependency directory must be inside the project: ${directory}`);
  }
  return path || ".";
}

export function ensureComposerDependencies(
  context: ProjectEnvironmentContext,
  options: ComposerDependenciesOptions = {},
): void {
  const directory = projectRelativeDirectory(context, context.backendDir);
  ensureMarkedInstall(context, "composer", {
    label: "Composer dependencies",
    cwd: context.backendDir,
    command: context.composerCommand,
    args: [...context.composerArgsPrefix, ...(options.installArgs ?? ["install"])],
    hashRoot: context.backendDir,
    hashFiles: ["composer.json", "composer.lock"],
    marker: `${directory}/vendor/.local-composer-install-hash`,
  });
}

export function ensureBunDependencies(
  context: ProjectEnvironmentContext,
  options: BunDependenciesOptions,
): void {
  const directory = resolve(context.root, options.directory);
  const projectDirectory = projectRelativeDirectory(context, directory);
  ensureMarkedInstall(context, options.step ?? "bun", {
    label: options.label ?? "Bun dependencies",
    cwd: directory,
    command: "bun",
    args: options.installArgs ?? ["install", "--frozen-lockfile"],
    hashRoot: directory,
    hashFiles: ["package.json", "bun.lock"],
    marker: `${projectDirectory}/node_modules/.local-install-hash`,
  });
}
