#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type ComposerJson = {
  name?: string;
  require?: Record<string, string>;
  "require-dev"?: Record<string, string>;
  scripts?: Record<string, string | string[]>;
};

type AppInfo = {
  path: string;
  dir: string;
  kind: string[];
  packageManager?: string;
  scripts: Record<string, string>;
  dependencies: string[];
  checks: string[];
};

type DdevInfo = {
  path: string;
  files: string[];
  overlays: string[];
  services: string[];
  summary: Record<string, string>;
};

const root = resolve(Bun.argv[2] ?? ".");
const maxDepth = 4;
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "vendor",
  "output",
  "dist",
  "build",
  ".expo",
  ".next",
  "Pods",
  ".gradle",
  "DerivedData",
]);

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`Path is not a directory: ${root}`);
  process.exit(1);
}

function walk(dir: string, depth = 0): string[] {
  if (depth > maxDepth) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(root, fullPath) || ".";

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name) || ignoredDirs.has(relPath)) {
        continue;
      }

      paths.push(fullPath, ...walk(fullPath, depth + 1));
      continue;
    }

    if (entry.isFile()) {
      paths.push(fullPath);
    }
  }

  return paths;
}

function readJson<T>(path: string): T | undefined {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function readText(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function rel(path: string): string {
  return relative(root, path) || ".";
}

function printList(title: string, items: string[]): void {
  console.log(`\n## ${title}`);

  if (!items.length) {
    console.log("- none found");
    return;
  }

  for (const item of items) {
    console.log(`- ${item}`);
  }
}

function fileExists(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

function dirExists(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

function detectPackageManager(appDir: string): string | undefined {
  const candidates = [
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ] as const;

  let current = appDir;

  while (current.startsWith(root)) {
    for (const [lockfile, manager] of candidates) {
      if (fileExists(join(current, lockfile))) {
        return manager;
      }
    }

    if (current === root) {
      break;
    }

    current = dirname(current);
  }

  return undefined;
}

function pickScripts(scripts: Record<string, string> = {}): Record<string, string> {
  const usefulNames = [
    "dev",
    "start",
    "android",
    "ios",
    "web",
    "test",
    "test:ci",
    "lint",
    "lint:check",
    "format",
    "format:check",
    "typecheck",
    "smoke:e2e",
    "before:deploy",
  ];

  return Object.fromEntries(
    usefulNames.filter((name) => scripts[name]).map((name) => [name, scripts[name]]),
  );
}

function dependencyNames(
  dependencies: Record<string, string> = {},
  devDependencies: Record<string, string> = {},
): string[] {
  return [...new Set([...Object.keys(dependencies), ...Object.keys(devDependencies)])].sort();
}

function detectPackage(path: string): AppInfo | undefined {
  const packageJson = readJson<PackageJson>(path);

  if (!packageJson) {
    return undefined;
  }

  const deps = dependencyNames(packageJson.dependencies, packageJson.devDependencies);
  const kind: string[] = [];

  if (deps.some((dep) => dep === "expo" || dep.includes("expo"))) {
    kind.push("Expo");
  }

  if (deps.includes("react-native")) {
    kind.push("React Native");
  }

  if (deps.includes("vite") || deps.includes("laravel-vite-plugin")) {
    kind.push("Vite");
  }

  if (deps.includes("react") || deps.includes("react-dom")) {
    kind.push("React");
  }

  if (!kind.length) {
    kind.push("Node");
  }

  const appDir = dirname(path);

  return {
    path: rel(path),
    dir: rel(appDir),
    kind,
    packageManager: detectPackageManager(appDir),
    scripts: pickScripts(packageJson.scripts),
    dependencies: deps,
    checks: detectJsChecks(appDir, packageJson.scripts ?? {}),
  };
}

function detectComposer(path: string): AppInfo | undefined {
  const composerJson = readJson<ComposerJson>(path);

  if (!composerJson) {
    return undefined;
  }

  const appDir = dirname(path);
  const deps = dependencyNames(composerJson.require, composerJson["require-dev"]);
  const kind = deps.includes("laravel/framework") ? ["Laravel"] : ["PHP"];
  const rawScripts = composerJson.scripts ?? {};
  const scripts = Object.fromEntries(
    Object.entries(rawScripts).map(([name, command]) => [
      name,
      Array.isArray(command) ? command.join(" && ") : command,
    ]),
  );

  return {
    path: rel(path),
    dir: rel(appDir),
    kind,
    packageManager: undefined,
    scripts: pickScripts(scripts),
    dependencies: deps,
    checks: detectLaravelChecks(appDir, deps),
  };
}

function detectDdev(ddevPath: string): DdevInfo {
  const files = walk(ddevPath)
    .filter((path) => path.includes(`${ddevPath}/`))
    .map(rel)
    .filter((path) => path.endsWith(".yaml") || path.endsWith(".yml") || path.includes(".ddev/commands/"))
    .filter((path) => !path.includes("/providers/"))
    .filter((path) => !path.includes("/traefik/"))
    .filter((path) => !path.includes("/README"))
    .filter((path) => !basename(path).startsWith(".ddev-docker-compose-"))
    .sort();
  const overlays = files.filter((path) => basename(path).startsWith("config.") || basename(path).startsWith("docker-compose."));
  const services = files
    .filter((file) => file.includes("docker-compose."))
    .map((file) => basename(file).replace(/^docker-compose\./, "").replace(/\.ya?ml$/, ""))
    .sort();
  const configPath = join(ddevPath, "config.yaml");

  return {
    path: rel(ddevPath),
    files,
    overlays,
    services,
    summary: existsSync(configPath) ? summarizeDdevConfig(readText(configPath)) : {},
  };
}

function summarizeDdevConfig(config: string): Record<string, string> {
  const keys = [
    "name",
    "type",
    "docroot",
    "php_version",
    "webserver_type",
    "database",
    "composer_root",
    "webimage_extra_packages",
  ];
  const summary: Record<string, string> = {};

  for (const key of keys) {
    const match = config.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));

    if (match?.[1]) {
      summary[key] = match[1].trim();
    }
  }

  const workingDir = config.match(/working_dir:\s*\n\s*web:\s*(.+)/m);

  if (workingDir?.[1]) {
    summary["working_dir.web"] = workingDir[1].trim();
  }

  return summary;
}

function detectJsChecks(appDir: string, scripts: Record<string, string>): string[] {
  const checks: string[] = [];
  const manager = detectPackageManager(appDir) ?? "npm";

  for (const name of ["typecheck", "lint", "test", "test:ci", "format:check"]) {
    if (scripts[name]) {
      checks.push(`${manager} run ${name}`);
    }
  }

  if (files.some((path) => dirname(path) === appDir && basename(path).startsWith("playwright.config"))) {
    checks.push(`${manager} run smoke:e2e`);
  }

  return checks;
}

function detectLaravelChecks(appDir: string, deps: string[]): string[] {
  const checks: string[] = [];

  if (deps.includes("pestphp/pest") || deps.includes("pestphp/pest-plugin-laravel")) {
    checks.push("ddev exec vendor/bin/pest");
  }

  if (
    deps.includes("larastan/larastan") ||
    deps.includes("phpstan/phpstan") ||
    files.some((path) => dirname(path) === appDir && basename(path).startsWith("phpstan"))
  ) {
    checks.push("ddev exec vendor/bin/phpstan analyse");
  }

  checks.push("ddev artisan migrate:status");

  return checks;
}

function findUrls(paths: string[]): string[] {
  const urlPattern = /https?:\/\/[^\s`"'<>),]+/g;
  const urls = new Set<string>();

  for (const path of paths) {
    const text = readText(path);

    for (const match of text.matchAll(urlPattern)) {
      urls.add(match[0]);
    }
  }

  return [...urls].sort();
}

function groupUrls(urls: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    Web: [],
    "QA Login": [],
    "Android API": [],
    Metro: [],
    Other: [],
  };

  for (const url of urls) {
    if (url.includes("localhost") && !url.match(/localhost:\d+/)) {
      continue;
    }

    if (url.includes(":808")) {
      groups.Metro.push(url);
    } else if (url.includes("qa-login")) {
      groups["QA Login"].push(url);
    } else if (url.startsWith("http://") && url.includes(".ddev.site")) {
      groups["Android API"].push(url);
    } else if (url.startsWith("https://") && url.includes(".ddev.site")) {
      groups.Web.push(url);
    } else {
      groups.Other.push(url);
    }
  }

  return Object.fromEntries(
    Object.entries(groups).map(([name, values]) => [name, [...new Set(values)].sort()]),
  );
}

function extractChecklistCommands(paths: string[]): string[] {
  const checklist = paths.find((path) => rel(path) === "CHECKLIST.md");

  if (!checklist) {
    return [];
  }

  return readText(checklist)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function extractQaHints(paths: string[]): string[] {
  const qaDocs = paths.filter((path) => basename(path) === "QA.md" || basename(path) === "AGENTS.md");
  const hints = new Set<string>();

  for (const path of qaDocs) {
    const text = readText(path);
    const tenantMatches = text.match(/[a-z0-9-]*qa[a-z0-9-]*/gi) ?? [];

    for (const match of tenantMatches) {
      if (match.length > 2) {
        hints.add(match);
      }
    }

    if (text.includes("1234")) {
      hints.add("OTP/local code: 1234");
    }
  }

  return [...hints].sort();
}

function containsAny(haystack: string[], needles: string[]): boolean {
  return needles.some((needle) => haystack.some((item) => item.toLowerCase().includes(needle)));
}

function detectDdevGaps(apps: AppInfo[], ddevRoots: DdevInfo[], envTexts: string[]): string[] {
  const gaps: string[] = [];
  const allDeps = apps.flatMap((app) => app.dependencies.map((dep) => dep.toLowerCase()));
  const allServices = ddevRoots.flatMap((ddev) => ddev.services.map((service) => service.toLowerCase()));
  const allEnv = envTexts.join("\n").toLowerCase();
  const hasLaravelS3Disk = files.some((path) => {
    if (basename(path) !== "filesystems.php") {
      return false;
    }

    const text = readText(path).toLowerCase();

    return text.includes("'s3'") || text.includes('"s3"') || text.includes("driver' => 's3") || text.includes('driver" => "s3');
  });

  const needsRedis =
    containsAny(allDeps, ["horizon", "redis"]) ||
    allEnv.includes("redis") ||
    allEnv.includes("cache_driver=redis") ||
    allEnv.includes("queue_connection=redis");

  if (needsRedis && !containsAny(allServices, ["redis"])) {
    gaps.push("Redis appears required, but no DDEV Redis service file was found.");
  }

  const needsSearch =
    containsAny(allDeps, ["laravel/scout", "typesense", "meilisearch"]) ||
    allEnv.includes("typesense") ||
    allEnv.includes("meilisearch");

  if (needsSearch && !containsAny(allServices, ["typesense", "meilisearch", "search"])) {
    gaps.push("Search appears required, but no DDEV Typesense/Meilisearch service file was found.");
  }

  const needsStorage = containsAny(allDeps, ["league/flysystem-aws-s3-v3"]) || allEnv.includes("aws_");

  if (needsStorage && !hasLaravelS3Disk) {
    gaps.push("Storage decision needed: config references S3/AWS, but Laravel filesystems config does not define an S3 disk.");
  } else if (needsStorage && !containsAny(allServices, ["minio", "s3"])) {
    gaps.push("Possible S3-like storage gap: config references S3/AWS, but no DDEV MinIO/S3 service file was found.");
  }

  if (ddevRoots.length > 1) {
    gaps.push(`Multiple DDEV roots found: ${ddevRoots.map((ddev) => ddev.path).join(", ")}.`);
  }

  return gaps;
}

function detectWarmStartReadiness(apps: AppInfo[], ddevRoots: DdevInfo[]): string[] {
  const readiness: string[] = [];

  for (const app of apps) {
    const appPath = join(root, app.dir);

    if (app.path.endsWith("package.json")) {
      readiness.push(
        `${app.dir}: ${dirExists(join(appPath, "node_modules")) ? "node_modules present" : "node_modules missing"}`,
      );
    }

    if (app.path.endsWith("composer.json")) {
      readiness.push(
        `${app.dir}: ${dirExists(join(appPath, "vendor")) ? "vendor present" : "vendor missing"}`,
      );
      readiness.push(
        `${app.dir}: ${fileExists(join(appPath, ".env")) ? ".env present" : ".env missing"}`,
      );
    }
  }

  readiness.push(
    ddevRoots.length
      ? `DDEV config present at ${ddevRoots.map((ddev) => ddev.path).join(", ")}`
      : "DDEV config missing",
  );

  return readiness;
}

function detectReuseCandidates(apps: AppInfo[]): string[] {
  const candidates: string[] = [];

  for (const app of apps) {
    const appPath = join(root, app.dir);

    if (app.path.endsWith("package.json") && dirExists(join(appPath, "node_modules"))) {
      candidates.push(`${app.dir}/node_modules`);
    }

    if (app.path.endsWith("composer.json") && dirExists(join(appPath, "vendor"))) {
      candidates.push(`${app.dir}/vendor`);
    }

    if (app.path.endsWith("composer.json") && fileExists(join(appPath, ".env"))) {
      candidates.push(`${app.dir}/.env`);
    }
  }

  return candidates;
}

const allPaths = walk(root);
const files = allPaths.filter((path) => statSync(path).isFile());
const dirs = allPaths.filter((path) => statSync(path).isDirectory());

const agentFiles = files.filter((path) => basename(path) === "AGENTS.md").map(rel).sort();
const docs = files
  .filter((path) => ["README.md", "QA.md", "CHECKLIST.md", "CONTEXT.md", "CONTEXT-MAP.md"].includes(basename(path)))
  .filter((path) => !rel(path).includes("/ios/") && !rel(path).includes("/android/"))
  .map(rel)
  .sort((a, b) => docRank(a) - docRank(b) || a.localeCompare(b));
const envExamples = files.filter((path) => basename(path).startsWith(".env") && basename(path).includes("example"));
const packageApps = files.filter((path) => basename(path) === "package.json").map(detectPackage).filter(Boolean) as AppInfo[];
const composerApps = files.filter((path) => basename(path) === "composer.json").map(detectComposer).filter(Boolean) as AppInfo[];
const appConfigs = files
  .filter((path) => ["app.json", "app.config.js", "app.config.ts", "eas.json"].includes(basename(path)))
  .map(rel)
  .sort();
const ddevRoots = dirs.filter((path) => basename(path) === ".ddev").map(detectDdev);
const docPathsForUrls = files
  .filter((path) => ["AGENTS.md", "QA.md", ".env.example"].includes(basename(path)))
  .filter((path) => !rel(path).includes("/ios/") && !rel(path).includes("/android/"));
const urls = findUrls(docPathsForUrls);
const urlGroups = groupUrls(urls);
const checklistCommands = extractChecklistCommands(files);
const qaHints = extractQaHints(docPathsForUrls);
const ddevGaps = detectDdevGaps(
  [...composerApps, ...packageApps],
  ddevRoots,
  envExamples.map(readText),
);
const warmStartReadiness = detectWarmStartReadiness([...composerApps, ...packageApps], ddevRoots);
const reuseCandidates = detectReuseCandidates([...composerApps, ...packageApps]);

console.log(`# Worktree Context: ${basename(root)}`);
console.log(`\nRoot: ${root}`);
printList("Agent And Project Docs", [...agentFiles, ...docs].sort((a, b) => docRank(a) - docRank(b) || a.localeCompare(b)));
printList("Environment Examples", envExamples.map(rel).sort());
printList("Mobile App Configs", appConfigs);
printList("Warm Start Readiness Signals", warmStartReadiness);
printList("Dependency And Env Reuse Candidates", reuseCandidates);
printList("Project Checklist Commands", checklistCommands);
printList("QA Hints", qaHints);

console.log("\n## Apps");
const apps = [...composerApps, ...packageApps].sort((a, b) => a.path.localeCompare(b.path));

if (!apps.length) {
  console.log("- none found");
} else {
  for (const app of apps) {
    console.log(`\n### ${app.path}`);
console.log(`- kind: ${app.kind.join(", ")}`);
    console.log(`- directory: ${app.dir}`);

    if (app.packageManager) {
      console.log(`- package manager: ${app.packageManager}`);
    }

    const usefulScripts = Object.entries(app.scripts);

    if (usefulScripts.length) {
      console.log("- scripts:");

      for (const [name, command] of usefulScripts) {
        console.log(`  - ${name}: ${command}`);
      }
    }

    if (app.checks.length) {
      console.log("- likely checks:");

      for (const check of app.checks) {
        console.log(`  - ${check}`);
      }
    }
  }
}

console.log("\n## DDEV");

if (!ddevRoots.length) {
  console.log("- none found");
} else {
  for (const ddev of ddevRoots) {
    console.log(`\n### ${ddev.path}`);
    const summary = Object.entries(ddev.summary);

    if (summary.length) {
      console.log("- config:");

      for (const [key, value] of summary) {
        console.log(`  - ${key}: ${value}`);
      }
    }

    console.log(`- services: ${ddev.services.length ? ddev.services.join(", ") : "none detected"}`);

    if (ddev.overlays.length) {
      console.log(`- overlays: ${ddev.overlays.join(", ")}`);
    }

    console.log("- files:");

    for (const file of ddev.files) {
      console.log(`  - ${file}`);
    }
  }
}

console.log("\n## Detected URLs");

for (const [name, values] of Object.entries(urlGroups)) {
  if (!values.length) {
    continue;
  }

  console.log(`\n### ${name}`);

  for (const value of values) {
    console.log(`- ${value}`);
  }
}

printList("DDEV Updates Or Blockers", ddevGaps);

function docRank(path: string): number {
  if (path === "AGENTS.md") {
    return 0;
  }

  if (path === "QA.md") {
    return 1;
  }

  if (path === "CHECKLIST.md") {
    return 2;
  }

  if (path.endsWith("/AGENTS.md")) {
    return 3;
  }

  if (path.endsWith("package.json") || path.endsWith("composer.json")) {
    return 4;
  }

  return 5;
}
