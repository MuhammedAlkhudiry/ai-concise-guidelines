import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "bun:test";

import {
  knowledgeFeature,
  knowledgeFind,
  knowledgeInit,
  knowledgeLearning,
  knowledgeLint,
  knowledgeList,
} from "./knowledge";

async function withProject(run: (project: string) => Promise<void>): Promise<void> {
  const project = await mkdtemp(join(tmpdir(), "my-setup-knowledge-"));
  try {
    await run(project);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}

async function capture(run: () => Promise<void>): Promise<string[]> {
  const output: string[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = (message?: unknown) => output.push(String(message));
  console.warn = (message?: unknown) => output.push(String(message));
  try {
    await run();
    return output;
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

describe("project knowledge commands", () => {
  test("initializes scarce-knowledge scaffolding", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeInit({ project }));
      expect(existsSync(join(project, "docs/knowledge/INDEX.md"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/glossary.md"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/features"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/learnings"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/decisions"))).toBe(false);
      expect(readFileSync(join(project, "docs/knowledge/INDEX.md"), "utf-8")).toContain(
        "durable product contracts",
      );
    });
  });

  test("creates a draft contract pack and indexes it once", async () => {
    await withProject(async (project) => {
      await capture(async () => {
        await knowledgeFeature("Billing Plans", { project });
        await knowledgeFeature("Billing Plans", { project });
      });
      const feature = readFileSync(
        join(project, "docs/knowledge/features/billing-plans.md"),
        "utf-8",
      );
      const index = readFileSync(join(project, "docs/knowledge/INDEX.md"), "utf-8");
      expect(feature).toContain("status: draft");
      expect(feature).toContain("## Product Contracts");
      expect(feature).not.toContain("## Language");
      expect(feature).not.toContain("## Evidence");
      expect(feature).not.toContain("last_verified");
      expect(index.match(/features\/billing-plans\.md/g)).toHaveLength(1);
    });
  });

  test("supports Unicode-only names and real YAML arrays", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeFeature("إدارة العائلة", { project }));
      const path = join(project, "docs/knowledge/features/إدارة-العائلة.md");
      expect(existsSync(path)).toBe(true);
      writeFileSync(
        path,
        readFileSync(path, "utf-8").replace("aliases: []", "aliases: [العائلة, الأسرة]"),
      );
      const output = await capture(() => knowledgeFind("الأسرة", { project }));
      expect(output).toContain(`- إدارة العائلة: docs/knowledge/features/إدارة-العائلة.md`);
    });
  });

  test("finds a bounded set of glossary terms and aliased documents", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeFeature("Family Sharing", { project }));
      const featurePath = join(project, "docs/knowledge/features/family-sharing.md");
      writeFileSync(
        featurePath,
        readFileSync(featurePath, "utf-8").replace("aliases: []", "aliases: [family link, invite]"),
      );
      writeFileSync(
        join(project, "docs/knowledge/glossary.md"),
        "# Glossary\n\n- **Family link** — The app entry URL for one family.\n",
      );
      const output = await capture(() => knowledgeFind("family link", { project, limit: 1 }));
      expect(output).toEqual([
        "Glossary:",
        "- Family link — The app entry URL for one family.",
        "Documents:",
        "- Family Sharing: docs/knowledge/features/family-sharing.md",
      ]);
    });
  });

  test("lists a concise inventory without expanding aliases", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeFeature("Onboarding", { project }));
      const path = join(project, "docs/knowledge/features/onboarding.md");
      writeFileSync(
        path,
        readFileSync(path, "utf-8").replace("aliases: []", "aliases: [signup, activation]"),
      );
      expect(await capture(() => knowledgeList({ project }))).toEqual([
        "Features:",
        "- Onboarding: docs/knowledge/features/onboarding.md",
      ]);
    });
  });

  test("creates a constraint learning without freshness metadata", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeLearning("Billing Renewal Race", { project }));
      const learning = readFileSync(
        join(project, `docs/knowledge/learnings/${today()}-billing-renewal-race.md`),
        "utf-8",
      );
      expect(learning).toContain("## Constraint");
      expect(learning).not.toContain("## Evidence");
      expect(learning).not.toContain("key_files");
      expect(learning).not.toContain("last_verified");
    });
  });

  test("lints source-free active contracts structurally", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeFeature("Billing", { project }));
      const path = join(project, "docs/knowledge/features/billing.md");
      writeFileSync(
        path,
        `---
name: Billing
aliases: [plans]
status: active
---

# Billing

## Product Contracts

### BILL-001 — A customer can subscribe

- **Given** an eligible customer
- **When** they choose a plan
- **Then** they can subscribe

## Boundaries

One active plan.
`,
      );
      const output = await capture(() => knowledgeLint({ project }));
      expect(output).toEqual([
        "Project knowledge lint passed structurally (1 documents, 0 warnings).",
      ]);
    });
  });

  test("rejects malformed contracts and source-file links", async () => {
    await withProject(async (project) => {
      await capture(() => knowledgeFeature("Billing", { project }));
      const path = join(project, "docs/knowledge/features/billing.md");
      writeFileSync(join(project, "source.md"), "# Source\n");
      writeFileSync(
        path,
        readFileSync(path, "utf-8")
          .replace("status: draft", "status: active")
          .replace("- **Then** the observable product outcome remains possible", ""),
      );
      writeFileSync(
        join(project, "docs/knowledge/INDEX.md"),
        readFileSync(join(project, "docs/knowledge/INDEX.md"), "utf-8").concat(
          "\n[Source](../../source.md)\n",
        ),
      );
      await expect(knowledgeLint({ project })).rejects.toThrow(/missing Then/);
      await expect(knowledgeLint({ project })).rejects.toThrow(/source file outside/);
    });
  });
});
