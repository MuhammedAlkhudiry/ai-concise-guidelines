import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

interface KnowledgeOptions {
  project?: string;
}

type KnowledgeDocumentType = "feature" | "learning";

interface KnowledgeDocument {
  name: string;
  path: string;
  type: KnowledgeDocumentType;
  aliases: string[];
  keyFiles: string[];
}

const KNOWLEDGE_DIR = "docs/knowledge";

function projectRoot(options: KnowledgeOptions): string {
  return resolve(options.project || process.cwd());
}

function knowledgeRoot(root: string): string {
  return join(root, KNOWLEDGE_DIR);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleize(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function indexTemplate(): string {
  return `# Project Knowledge

Start here when a task mentions product areas, feature names, domain terms, workflows, or business context.

## Features

## Learnings

## Decisions

## Use

- Read the matching feature pack before inspecting code.
- Read matching bug learnings when a bug took long investigation or revealed a durable system behavior.
- Treat knowledge files as intent, language, history, and code maps.
- Treat code and tests as the source of truth for current behavior.
`;
}

function glossaryTemplate(): string {
  return `# Glossary

Record project-specific terms whose meaning is not obvious from code.
`;
}

function featureTemplate(name: string): string {
  return `---
name: ${name}
aliases: []
key_files: []
last_verified: ${today()}
---

# ${name}

## Meaning

What this feature means in the product or business.

## Current Behavior

The important workflows, states, and invariants.

## Glossary

Terms that have project-specific meaning inside this feature.

## Code Map

Why the key files matter.

## History

Decisions, migrations, abandoned approaches, and sharp edges.

## Known Learnings

Links to hard-earned bug learnings that still matter for this feature.

## Update When

Changes that should update this knowledge pack.
`;
}

function bugLearningTemplate(title: string): string {
  return `---
title: ${title}
feature:
related_features: []
key_files: []
fixed_in:
last_verified: ${today()}
---

# ${title}

## What Broke

The symptom and user/system impact.

## Root Cause

The real mechanism, not just the symptom.

## Why It Was Hard

What made this take long investigation or many steps to detect.

## Durable Learning

The rule future agents should remember.

## Regression Protection

Tests, guards, monitoring, or code paths that now protect this.

## Update Related Knowledge

Feature packs, glossary terms, aliases, or index entries updated because of this.
`;
}

async function writeMissing(path: string, content: string): Promise<boolean> {
  if (existsSync(path)) {
    return false;
  }

  await writeFile(path, content);
  return true;
}

async function ensureKnowledgeStructure(root: string): Promise<string[]> {
  const dir = knowledgeRoot(root);
  await mkdir(join(dir, "features"), { recursive: true });
  await mkdir(join(dir, "learnings"), { recursive: true });
  await mkdir(join(dir, "decisions"), { recursive: true });

  const created: string[] = [];
  if (await writeMissing(join(dir, "INDEX.md"), indexTemplate())) {
    created.push(relative(root, join(dir, "INDEX.md")));
  }
  if (await writeMissing(join(dir, "glossary.md"), glossaryTemplate())) {
    created.push(relative(root, join(dir, "glossary.md")));
  }

  return created;
}

async function updateIndexSection(
  root: string,
  heading: string,
  name: string,
  relativePath: string,
): Promise<void> {
  const indexPath = join(knowledgeRoot(root), "INDEX.md");
  const link = `- [${name}](${relativePath})`;
  const content = await readFile(indexPath, "utf-8");

  if (content.includes(`](${relativePath})`)) {
    return;
  }

  const lines = content.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) {
    await writeFile(indexPath, `${content.trimEnd()}\n\n${heading}\n\n${link}\n`);
    return;
  }

  let insertAt = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      insertAt = i;
      break;
    }
  }

  while (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === "") {
    insertAt--;
  }

  lines.splice(insertAt, 0, link, "");
  await writeFile(indexPath, lines.join("\n").replace(/\n+$/, "\n"));
}

async function updateFeatureIndex(root: string, name: string, slug: string): Promise<void> {
  await updateIndexSection(root, "## Features", name, `features/${slug}.md`);
}

async function updateLearningIndex(root: string, title: string, slug: string): Promise<void> {
  await updateIndexSection(root, "## Learnings", title, `learnings/${today()}-${slug}.md`);
}

function parseFrontmatterList(content: string, field: string): string[] {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    return [];
  }

  const lines = frontmatter[1].split(/\r?\n/);
  const values: string[] = [];
  const start = lines.findIndex((line) => line.trim() === `${field}:`);
  if (start === -1) {
    return values;
  }

  for (const line of lines.slice(start + 1)) {
    if (/^\w/.test(line)) {
      break;
    }

    const match = line.match(/^\s*-\s*(.+?)\s*$/);
    if (match) {
      values.push(match[1].replace(/^["']|["']$/g, ""));
    }
  }

  return values;
}

function parseFeatureName(content: string, fallback: string): string {
  const match = content.match(/^name:\s*(.+)$/m);
  return match ? match[1].replace(/^["']|["']$/g, "") : titleize(fallback);
}

function parseLearningTitle(content: string, fallback: string): string {
  const match = content.match(/^title:\s*(.+)$/m);
  return match ? match[1].replace(/^["']|["']$/g, "") : titleize(fallback);
}

async function readKnowledgeDocuments(
  root: string,
  type: KnowledgeDocumentType,
): Promise<KnowledgeDocument[]> {
  const subdir = type === "feature" ? "features" : "learnings";
  const dir = join(knowledgeRoot(root), subdir);
  if (!existsSync(dir)) {
    return [];
  }

  const files = (await readdir(dir)).filter((file) => file.endsWith(".md")).sort();
  return Promise.all(
    files.map(async (file) => {
      const path = join(dir, file);
      const content = await readFile(path, "utf-8");
      const fallback = basename(file, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
      return {
        name:
          type === "feature"
            ? parseFeatureName(content, fallback)
            : parseLearningTitle(content, fallback),
        path,
        type,
        aliases: parseFrontmatterList(content, "aliases"),
        keyFiles: parseFrontmatterList(content, "key_files"),
      };
    }),
  );
}

async function readAllKnowledgeDocuments(root: string): Promise<KnowledgeDocument[]> {
  return [
    ...(await readKnowledgeDocuments(root, "feature")),
    ...(await readKnowledgeDocuments(root, "learning")),
  ];
}

export async function knowledgeInit(options: KnowledgeOptions = {}): Promise<void> {
  const root = projectRoot(options);
  const created = await ensureKnowledgeStructure(root);

  if (created.length) {
    console.log(
      `Created project knowledge files:\n${created.map((path) => `- ${path}`).join("\n")}`,
    );
    return;
  }

  console.log(`Project knowledge already exists at ${KNOWLEDGE_DIR}`);
}

export async function knowledgeFeature(
  name: string,
  options: KnowledgeOptions = {},
): Promise<void> {
  if (!name) {
    throw new Error("Feature name is required");
  }

  const root = projectRoot(options);
  await ensureKnowledgeStructure(root);

  const featureName = titleize(name);
  const slug = slugify(name);
  if (!slug) {
    throw new Error(`Feature name cannot produce a slug: ${name}`);
  }

  const featurePath = join(knowledgeRoot(root), "features", `${slug}.md`);
  const created = await writeMissing(featurePath, featureTemplate(featureName));
  await updateFeatureIndex(root, featureName, slug);

  console.log(`${created ? "Created" : "Feature already exists"}: ${relative(root, featurePath)}`);
}

export async function knowledgeLearning(
  title: string,
  options: KnowledgeOptions = {},
): Promise<void> {
  if (!title) {
    throw new Error("Learning title is required");
  }

  const root = projectRoot(options);
  await ensureKnowledgeStructure(root);

  const learningTitle = titleize(title);
  const slug = slugify(title);
  if (!slug) {
    throw new Error(`Learning title cannot produce a slug: ${title}`);
  }

  const learningPath = join(knowledgeRoot(root), "learnings", `${today()}-${slug}.md`);
  const created = await writeMissing(learningPath, bugLearningTemplate(learningTitle));
  await updateLearningIndex(root, learningTitle, slug);

  console.log(
    `${created ? "Created" : "Learning already exists"}: ${relative(root, learningPath)}`,
  );
}

export async function knowledgeList(options: KnowledgeOptions = {}): Promise<void> {
  const root = projectRoot(options);
  const features = await readKnowledgeDocuments(root, "feature");
  const learnings = await readKnowledgeDocuments(root, "learning");

  if (!features.length && !learnings.length) {
    console.log("No project knowledge documents found.");
    return;
  }

  if (features.length) {
    console.log("Features:");
  }
  for (const pack of features) {
    const aliases = pack.aliases.length ? ` (aliases: ${pack.aliases.join(", ")})` : "";
    console.log(`- ${pack.name}${aliases}: ${relative(root, pack.path)}`);
  }

  if (learnings.length) {
    if (features.length) {
      console.log("");
    }
    console.log("Learnings:");
  }
  for (const learning of learnings) {
    console.log(`- ${learning.name}: ${relative(root, learning.path)}`);
  }
}

export async function knowledgeCheck(options: KnowledgeOptions = {}): Promise<void> {
  const root = projectRoot(options);
  const dir = knowledgeRoot(root);
  if (!existsSync(dir)) {
    throw new Error(`Project knowledge is missing: ${KNOWLEDGE_DIR}`);
  }

  const packs = await readAllKnowledgeDocuments(root);
  const missing: string[] = [];

  for (const pack of packs) {
    for (const keyFile of pack.keyFiles) {
      if (!existsSync(join(root, keyFile))) {
        missing.push(`${relative(root, pack.path)} references missing key file: ${keyFile}`);
      }
    }
  }

  if (missing.length) {
    throw new Error(`Project knowledge check failed:\n${missing.join("\n")}`);
  }

  console.log(`Project knowledge check passed (${packs.length} documents).`);
}
