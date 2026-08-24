import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

interface KnowledgeOptions {
  project?: string;
}
interface KnowledgeFindOptions extends KnowledgeOptions {
  limit?: number | string;
}
type KnowledgeDocumentType = "feature" | "learning";
type KnowledgeStatus = "draft" | "active" | "vision" | "retired";

interface KnowledgeDocument {
  name: string;
  path: string;
  type: KnowledgeDocumentType;
  aliases: string[];
  status?: KnowledgeStatus;
  content: string;
  frontmatter: Record<string, unknown>;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

const KNOWLEDGE_DIR = "docs/knowledge";
const DOCUMENT_DIRS: Record<KnowledgeDocumentType, string> = {
  feature: "features",
  learning: "learnings",
};
const VALID_STATUSES = new Set<KnowledgeStatus>(["draft", "active", "vision", "retired"]);

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
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
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

Use the glossary to share project language. Use feature packs for durable product contracts, boundaries, and scarce rationale that cannot be recovered from code.

## Features

## Learnings
`;
}

function glossaryTemplate(): string {
  return `# Glossary

Define only project-specific terms needed for users and agents to speak the same language.

<!-- - **Term** — A short, canonical definition. -->
`;
}

function featureTemplate(name: string): string {
  return `---
name: ${name}
aliases: []
status: draft
---

# ${name}

## Product Contracts

### FEATURE-001 — Name the promised capability

- **Given** the relevant starting state
- **When** the user performs the action
- **Then** the observable product outcome remains possible

## Boundaries

Only durable exclusions, authority boundaries, and compatibility constraints.

## Rationale

Only decisions whose reasoning is scarce and whose rejected alternative could realistically recur.
`;
}

function bugLearningTemplate(title: string): string {
  return `---
title: ${title}
feature:
related_features: []
status: draft
---

# ${title}

## Constraint

The non-obvious external, platform, or product constraint that a test alone cannot explain.

## Consequence

The durable decision this constraint requires. Move observable regression behavior into a test or product contract.
`;
}

async function writeMissing(path: string, content: string): Promise<boolean> {
  if (existsSync(path)) return false;
  await writeFile(path, content);
  return true;
}

async function ensureKnowledgeStructure(root: string): Promise<string[]> {
  const dir = knowledgeRoot(root);
  await Promise.all(
    Object.values(DOCUMENT_DIRS).map((subdir) => mkdir(join(dir, subdir), { recursive: true })),
  );
  const created: string[] = [];
  if (await writeMissing(join(dir, "INDEX.md"), indexTemplate()))
    created.push(relative(root, join(dir, "INDEX.md")));
  if (await writeMissing(join(dir, "glossary.md"), glossaryTemplate()))
    created.push(relative(root, join(dir, "glossary.md")));
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
  if (content.includes(`](${relativePath})`)) return;
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
  while (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === "") insertAt--;
  lines.splice(insertAt, 0, link, "");
  await writeFile(indexPath, lines.join("\n").replace(/\n+$/, "\n"));
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  const parsed = Bun.YAML.parse(match[1]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("frontmatter must be a YAML object");
  return parsed as Record<string, unknown>;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function documentName(
  type: KnowledgeDocumentType,
  frontmatter: Record<string, unknown>,
  fallback: string,
): string {
  const value = type === "feature" ? frontmatter.name : frontmatter.title;
  return typeof value === "string" && value.trim() ? value.trim() : titleize(fallback);
}

async function readKnowledgeDocuments(
  root: string,
  type: KnowledgeDocumentType,
): Promise<KnowledgeDocument[]> {
  const dir = join(knowledgeRoot(root), DOCUMENT_DIRS[type]);
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md")).sort();
  return Promise.all(
    files.map(async (file) => {
      const path = join(dir, file);
      const content = await readFile(path, "utf-8");
      const fallback = basename(file, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
      let frontmatter: Record<string, unknown>;
      try {
        frontmatter = parseFrontmatter(content);
      } catch (error) {
        throw new Error(
          `${relative(root, path)} has invalid YAML frontmatter: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      const status = typeof frontmatter.status === "string" ? frontmatter.status : undefined;
      return {
        name: documentName(type, frontmatter, fallback),
        path,
        type,
        aliases: stringList(frontmatter.aliases),
        status: VALID_STATUSES.has(status as KnowledgeStatus)
          ? (status as KnowledgeStatus)
          : undefined,
        content,
        frontmatter,
      };
    }),
  );
}

async function readAllKnowledgeDocuments(root: string): Promise<KnowledgeDocument[]> {
  return (
    await Promise.all(
      (Object.keys(DOCUMENT_DIRS) as KnowledgeDocumentType[]).map((type) =>
        readKnowledgeDocuments(root, type),
      ),
    )
  ).flat();
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function searchScore(query: string, values: string[]): number {
  const normalizedQuery = normalizeSearch(query);
  const queryTokens = new Set(normalizedQuery.split(" ").filter(Boolean));
  let best = 0;
  values.forEach((value, index) => {
    const normalizedValue = normalizeSearch(value);
    if (normalizedValue === normalizedQuery) {
      best = Math.max(best, index === 0 ? 100 : 90);
      return;
    }
    if (normalizedValue.includes(normalizedQuery) || normalizedQuery.includes(normalizedValue))
      best = Math.max(best, index === 0 ? 70 : 60);
    const overlap = normalizedValue
      .split(" ")
      .filter(Boolean)
      .filter((token) => queryTokens.has(token)).length;
    best = Math.max(best, overlap * 10);
  });
  return best;
}

function parseGlossary(content: string): GlossaryTerm[] {
  const terms: GlossaryTerm[] = [];
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*-\s+\*\*(.+?)\*\*\s*(?:—|:|-)\s*(.+?)\s*$/);
    if (match) terms.push({ term: match[1].trim(), definition: match[2].trim() });
  }
  return terms;
}

function section(content: string, heading: string): string | undefined {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^## ${escaped}\\s*$`, "m").exec(content);
  if (!match) return undefined;
  const remainder = content.slice((match.index ?? 0) + match[0].length);
  const nextHeading = /^## /m.exec(remainder);
  return remainder.slice(0, nextHeading?.index ?? remainder.length);
}

function contractBlocks(content: string): Array<{ id: string; body: string }> {
  const headings = [...content.matchAll(/^###\s+([A-Z][A-Z0-9]*-\d{3,})\s+(?:—|-)\s+.+$/gm)];
  return headings.map((heading, index) => ({
    id: heading[1],
    body: content.slice(
      (heading.index ?? 0) + heading[0].length,
      headings[index + 1]?.index ?? content.length,
    ),
  }));
}

function secondLevelHeadings(content: string): string[] {
  return [...content.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]);
}

function localMarkdownLinks(content: string): string[] {
  return [...content.matchAll(/\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^<|>$/g, ""))
    .filter((target) => !/^(?:[a-z]+:|#)/i.test(target))
    .map((target) => target.split("#", 1)[0])
    .filter(Boolean);
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
  if (!name) throw new Error("Feature name is required");
  const root = projectRoot(options);
  await ensureKnowledgeStructure(root);
  const featureName = titleize(name);
  const slug = slugify(name);
  if (!slug) throw new Error(`Feature name cannot produce a slug: ${name}`);
  const featurePath = join(knowledgeRoot(root), "features", `${slug}.md`);
  const created = await writeMissing(featurePath, featureTemplate(featureName));
  await updateIndexSection(root, "## Features", featureName, `features/${slug}.md`);
  console.log(`${created ? "Created" : "Feature already exists"}: ${relative(root, featurePath)}`);
}

export async function knowledgeLearning(
  title: string,
  options: KnowledgeOptions = {},
): Promise<void> {
  if (!title) throw new Error("Learning title is required");
  const root = projectRoot(options);
  await ensureKnowledgeStructure(root);
  const learningTitle = titleize(title);
  const slug = slugify(title);
  if (!slug) throw new Error(`Learning title cannot produce a slug: ${title}`);
  const learningPath = join(knowledgeRoot(root), "learnings", `${today()}-${slug}.md`);
  const created = await writeMissing(learningPath, bugLearningTemplate(learningTitle));
  await updateIndexSection(root, "## Learnings", learningTitle, `learnings/${today()}-${slug}.md`);
  console.log(
    `${created ? "Created" : "Learning already exists"}: ${relative(root, learningPath)}`,
  );
}

export async function knowledgeList(options: KnowledgeOptions = {}): Promise<void> {
  const root = projectRoot(options);
  const documents = await readAllKnowledgeDocuments(root);
  if (!documents.length) {
    console.log("No project knowledge documents found.");
    return;
  }
  for (const type of Object.keys(DOCUMENT_DIRS) as KnowledgeDocumentType[]) {
    const matching = documents.filter((document) => document.type === type);
    if (!matching.length) continue;
    console.log(`${titleize(`${type}s`)}:`);
    for (const document of matching)
      console.log(`- ${document.name}: ${relative(root, document.path)}`);
  }
}

export async function knowledgeFind(
  query: string,
  options: KnowledgeFindOptions = {},
): Promise<void> {
  if (!query.trim()) throw new Error("Search query is required");
  const root = projectRoot(options);
  const documents = await readAllKnowledgeDocuments(root);
  const glossaryPath = join(knowledgeRoot(root), "glossary.md");
  const glossary = existsSync(glossaryPath)
    ? parseGlossary(await readFile(glossaryPath, "utf-8"))
    : [];
  const limit = Math.max(1, Math.min(10, Number(options.limit) || 3));
  const minimumScore = normalizeSearch(query).split(" ").filter(Boolean).length > 1 ? 20 : 10;
  const terms = glossary
    .map((term) => ({ term, score: searchScore(query, [term.term, term.definition]) }))
    .filter(({ score }) => score >= minimumScore)
    .sort((a, b) => b.score - a.score || a.term.term.localeCompare(b.term.term))
    .slice(0, limit);
  const matches = documents
    .map((document) => ({
      document,
      score: searchScore(query, [document.name, ...document.aliases]),
    }))
    .filter(({ score }) => score >= minimumScore)
    .sort((a, b) => b.score - a.score || a.document.name.localeCompare(b.document.name))
    .slice(0, limit);
  if (!terms.length && !matches.length) {
    console.log(`No project knowledge matched: ${query}`);
    return;
  }
  if (terms.length) {
    console.log("Glossary:");
    for (const { term } of terms) console.log(`- ${term.term} — ${term.definition}`);
  }
  if (matches.length) {
    console.log("Documents:");
    for (const { document } of matches)
      console.log(`- ${document.name}: ${relative(root, document.path)}`);
  }
}

export async function knowledgeLint(options: KnowledgeOptions = {}): Promise<void> {
  const root = projectRoot(options);
  const dir = knowledgeRoot(root);
  if (!existsSync(dir)) throw new Error(`Project knowledge is missing: ${KNOWLEDGE_DIR}`);
  const errors: string[] = [];
  const warnings: string[] = [];
  const documents: KnowledgeDocument[] = [];
  for (const type of Object.keys(DOCUMENT_DIRS) as KnowledgeDocumentType[]) {
    try {
      documents.push(...(await readKnowledgeDocuments(root, type)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  const identities = new Map<string, KnowledgeDocument>();
  const contractIds = new Map<string, string>();
  for (const document of documents) {
    const path = relative(root, document.path);
    const requiredField = document.type === "feature" ? "name" : "title";
    const declaredName = document.frontmatter[requiredField];
    if (
      document.frontmatter.status !== undefined &&
      (typeof declaredName !== "string" || !declaredName.trim())
    ) {
      errors.push(`${path} is missing required ${requiredField}.`);
    }
    if ("aliases" in document.frontmatter && !Array.isArray(document.frontmatter.aliases)) {
      errors.push(`${path} aliases must be a YAML array.`);
    }
    const declaredStatus = document.frontmatter.status;
    if (declaredStatus === undefined)
      warnings.push(`${path} uses the legacy format (missing status).`);
    else if (
      typeof declaredStatus !== "string" ||
      !VALID_STATUSES.has(declaredStatus as KnowledgeStatus)
    )
      errors.push(`${path} has invalid status: ${String(declaredStatus)}`);
    for (const legacyField of ["key_files", "last_verified"]) {
      if (legacyField in document.frontmatter)
        errors.push(`${path} still declares legacy ${legacyField}.`);
    }
    for (const identity of [document.name, ...document.aliases]) {
      const normalized = normalizeSearch(identity);
      if (!normalized) continue;
      const existing = identities.get(normalized);
      if (existing) {
        if (existing.path === document.path) continue;
        const duplicate = `${path} duplicates name or alias "${identity}" from ${relative(root, existing.path)}.`;
        if (document.status === "active" && existing.status === "active") errors.push(duplicate);
        else warnings.push(duplicate);
      } else identities.set(normalized, document);
    }
    if (
      document.type === "feature" &&
      (document.status === "active" || document.status === "vision")
    ) {
      for (const heading of ["Product Contracts", "Boundaries"]) {
        if (section(document.content, heading) === undefined)
          errors.push(`${path} is missing ## ${heading}.`);
      }
      for (const heading of secondLevelHeadings(document.content)) {
        if (!["Product Contracts", "Boundaries", "Rationale"].includes(heading))
          errors.push(`${path} contains unsupported ## ${heading}.`);
      }
      const contracts = contractBlocks(section(document.content, "Product Contracts") ?? "");
      if (!contracts.length) errors.push(`${path} has no product contracts.`);
      for (const contract of contracts) {
        const existingPath = contractIds.get(contract.id);
        if (existingPath)
          errors.push(`${path} duplicates contract ID ${contract.id} from ${existingPath}.`);
        else contractIds.set(contract.id, path);
        for (const keyword of ["Given", "When", "Then"]) {
          if (!new RegExp(`(?:\\*\\*)?${keyword}(?:\\*\\*)?`, "i").test(contract.body))
            errors.push(`${path} contract ${contract.id} is missing ${keyword}.`);
        }
      }
      const wordCount = document.content.trim().split(/\s+/).length;
      if (wordCount > 600)
        errors.push(`${path} exceeds the 600-word scarcity limit (${wordCount}).`);
    }
    if (document.type === "learning" && document.status === "active") {
      for (const heading of ["Constraint", "Consequence"]) {
        if (section(document.content, heading) === undefined)
          errors.push(`${path} is missing ## ${heading}.`);
      }
      for (const heading of secondLevelHeadings(document.content)) {
        if (!["Constraint", "Consequence"].includes(heading))
          errors.push(`${path} contains unsupported ## ${heading}.`);
      }
    }
  }
  const markdownFiles = (await readdir(dir, { recursive: true }))
    .filter((path): path is string => typeof path === "string" && path.endsWith(".md"))
    .sort();
  for (const markdownFile of markdownFiles) {
    const markdownPath = join(dir, markdownFile);
    const path = relative(root, markdownPath);
    const content = await readFile(markdownPath, "utf-8");
    for (const target of localMarkdownLinks(content)) {
      const resolvedTarget = resolve(dirname(markdownPath), target);
      if (!existsSync(resolvedTarget))
        errors.push(`${path} links to a missing knowledge file: ${target}`);
      else if (!resolvedTarget.startsWith(`${dir}/`))
        errors.push(`${path} links to a source file outside project knowledge: ${target}`);
    }
  }
  const glossaryPath = join(dir, "glossary.md");
  if (existsSync(glossaryPath)) {
    const seenTerms = new Map<string, string>();
    for (const { term } of parseGlossary(await readFile(glossaryPath, "utf-8"))) {
      const normalized = normalizeSearch(term);
      const existing = seenTerms.get(normalized);
      if (existing)
        errors.push(`docs/knowledge/glossary.md duplicates "${term}" and "${existing}".`);
      else seenTerms.set(normalized, term);
    }
  }
  if (errors.length) throw new Error(`Project knowledge lint failed:\n${errors.join("\n")}`);
  for (const warning of warnings) console.warn(`Warning: ${warning}`);
  console.log(
    `Project knowledge lint passed structurally (${documents.length} documents, ${warnings.length} warnings).`,
  );
}
