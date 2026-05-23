#!/usr/bin/env bun

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

type Json = Record<string, unknown>;

const root = resolve(Bun.argv[2] ?? ".");
const maxDepth = 5;
const ignored = new Set([".git", "node_modules", "vendor", "output", "dist", "build", ".next", ".expo"]);

function read(path: string): string {
  try {
    return readFileSync(join(root, path), "utf8");
  } catch {
    return "";
  }
}

function json(path: string): Json {
  try {
    return JSON.parse(read(path)) as Json;
  } catch {
    return {};
  }
}

function has(path: string): boolean {
  return existsSync(join(root, path));
}

function walk(dir = root, depth = 0): string[] {
  if (depth > maxDepth) return [];

  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) files.push(...walk(path, depth + 1));
      continue;
    }
    if (entry.isFile()) {
      const rel = relative(root, path);
      files.push(rel);
    }
  }
  return files;
}

function deps(): string[] {
  const packageJson = json("package.json");
  const composerJson = json("composer.json");
  return [
    ...Object.keys((packageJson.dependencies as Json | undefined) ?? {}),
    ...Object.keys((packageJson.devDependencies as Json | undefined) ?? {}),
    ...Object.keys((composerJson.require as Json | undefined) ?? {}),
    ...Object.keys((composerJson["require-dev"] as Json | undefined) ?? {}),
  ].sort();
}

function findFiles(pattern: RegExp, files: string[]): string[] {
  return files.filter((file) => pattern.test(file)).slice(0, 12);
}

const files = walk();
const dependencies = deps();
const envText = [".env.example", ".env", "config/services.php", "config/queue.php", "config/cache.php"]
  .filter(has)
  .map(read)
  .join("\n");
const docs = files.filter((file) => /(?:README|PRODUCT|DEPLOY|OPS|RUNBOOK|AGENTS|QA).*\.md$/i.test(file));
const searchableText = [
  envText,
  ...docs.map(read),
  ...findFiles(/agent|assistant|conversation|ai[_-]|llm|openai|anthropic/i, files).map(read),
].join("\n");

const sources: Array<[string, boolean, string]> = [
  ["Sentry", dependencies.some((dep) => dep.includes("sentry")) || /SENTRY_/i.test(envText), "Use sentry-cli for issues, events, traces, spans, slow APIs, and job exceptions."],
  ["PostHog", dependencies.some((dep) => dep.includes("posthog")) || /POSTHOG_/i.test(envText), "Use PostHog API/skills for product analytics, metric investigations, and SDK health."],
  ["AI/agentic features", dependencies.some((dep) => /openai|anthropic|ai-sdk|laravel-ai/.test(dep)) || /agent|assistant|conversation|tool call|ai_usage|ai_agent|llm|OPENAI_|ANTHROPIC_/i.test(searchableText), "Audit adoption, repeated intents, run success/failure, latency, tool/action distribution, unresolved sessions, proposal follow-through, and credit/cost pressure."],
  ["Laravel queues", dependencies.includes("laravel/framework") && /QUEUE_CONNECTION|queue/i.test(envText), "Check failed jobs, queue depth, oldest job age, retry loops, and worker/Horizon status."],
  ["Horizon", dependencies.includes("laravel/horizon") || files.some((file) => file.includes("Horizon")), "Check Horizon supervisors, recent failures, queue wait, and retry loops."],
  ["Scheduler", files.some((file) => /routes\/console\.php|app\/Console\/Kernel\.php/.test(file)), "Check scheduled commands, last successful run evidence, and missed recurring work."],
  ["Redis", /REDIS_|CACHE_STORE=redis|SESSION_DRIVER=redis|QUEUE_CONNECTION=redis/i.test(envText), "Check PING, INFO memory, clients, evictions, SLOWLOG, and LATENCY."],
  ["Typesense/search", dependencies.some((dep) => dep.includes("typesense") || dep.includes("scout")) || /TYPESENSE_|SCOUT_DRIVER/i.test(envText), "Check search health, collection stats, indexing drift, and Sentry search errors."],
  ["DigitalOcean database", /doctl|digitalocean|DB_HOST/i.test([...docs.map(read), envText].join("\n")), "Use doctl for managed database status, backups, events, storage, and connection clues."],
  ["Forge/server", /forge|supervisor|nginx|php-fpm/i.test([...docs.map(read), envText].join("\n")), "Use Forge CLI or SSH for uptime, disk, memory, PHP-FPM, Nginx, Supervisor, and logs."],
];

console.log(`# Health source discovery for ${basename(root)}`);
console.log(`Root: ${root}`);

console.log("\n## Detected sources");
for (const [name, found, check] of sources) {
  console.log(`- ${found ? "yes" : "no "} ${name}: ${check}`);
}

console.log("\n## Evidence files");
for (const file of [
  ...docs.slice(0, 12),
  ...findFiles(/agent|assistant|conversation|ai[_-]|llm|openai|anthropic/i, files),
  ...findFiles(/composer\.json|package\.json|config\/(?:queue|cache|services|database)\.php|routes\/console\.php|app\/Console\/Kernel\.php/, files),
]) {
  console.log(`- ${file}`);
}

console.log("\n## Access gaps to confirm");
for (const item of ["Sentry org/project", "PostHog project", "AI usage/conversation data source", "SSH or Forge target", "database provider", "Redis access path"]) {
  console.log(`- ${item}`);
}
