import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "bun:test";

import {
  knowledgeCheck,
  knowledgeFeature,
  knowledgeInit,
  knowledgeLearning,
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
  const original = console.log;
  console.log = (message?: unknown) => {
    output.push(String(message));
  };

  try {
    await run();
    return output;
  } finally {
    console.log = original;
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

describe("project knowledge commands", () => {
  test("initializes project knowledge files", async () => {
    await withProject(async (project) => {
      await capture(async () => knowledgeInit({ project }));

      expect(existsSync(join(project, "docs/knowledge/INDEX.md"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/glossary.md"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/features"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/learnings"))).toBe(true);
      expect(existsSync(join(project, "docs/knowledge/decisions"))).toBe(true);
    });
  });

  test("creates a feature pack and indexes it once", async () => {
    await withProject(async (project) => {
      await capture(async () => {
        await knowledgeFeature("Billing Plans", { project });
        await knowledgeFeature("Billing Plans", { project });
      });

      const featurePath = join(project, "docs/knowledge/features/billing-plans.md");
      const index = readFileSync(join(project, "docs/knowledge/INDEX.md"), "utf-8");

      expect(readFileSync(featurePath, "utf-8")).toContain("name: Billing Plans");
      expect(index.match(/features\/billing-plans\.md/g)).toHaveLength(1);
    });
  });

  test("lists feature packs", async () => {
    await withProject(async (project) => {
      await capture(async () => knowledgeFeature("Onboarding", { project }));
      writeFileSync(
        join(project, "docs/knowledge/features/onboarding.md"),
        `---
name: Onboarding
aliases:
  - signup
  - activation
key_files: []
last_verified: 2026-06-08
---
`,
      );

      const output = await capture(async () => knowledgeList({ project }));

      expect(output).toEqual([
        "Features:",
        "- Onboarding (aliases: signup, activation): docs/knowledge/features/onboarding.md",
      ]);
    });
  });

  test("creates a hard-earned bug learning and indexes it once", async () => {
    await withProject(async (project) => {
      await capture(async () => {
        await knowledgeLearning("Billing Renewal Race", { project });
        await knowledgeLearning("Billing Renewal Race", { project });
      });

      const learningPath = join(
        project,
        `docs/knowledge/learnings/${today()}-billing-renewal-race.md`,
      );
      const index = readFileSync(join(project, "docs/knowledge/INDEX.md"), "utf-8");
      const output = await capture(async () => knowledgeList({ project }));

      expect(readFileSync(learningPath, "utf-8")).toContain("title: Billing Renewal Race");
      expect(index.match(/learnings\/\d{4}-\d{2}-\d{2}-billing-renewal-race\.md/g)).toHaveLength(1);
      expect(output).toEqual([
        "Learnings:",
        `- Billing Renewal Race: docs/knowledge/learnings/${today()}-billing-renewal-race.md`,
      ]);
    });
  });

  test("checks feature key file references", async () => {
    await withProject(async (project) => {
      mkdirSync(join(project, "app"), { recursive: true });
      writeFileSync(join(project, "app/Billing.php"), "<?php\n");
      await capture(async () => knowledgeFeature("Billing", { project }));
      writeFileSync(
        join(project, "docs/knowledge/features/billing.md"),
        `---
name: Billing
aliases: []
key_files:
  - app/Billing.php
  - app/Missing.php
last_verified: 2026-06-08
---
`,
      );

      await expect(knowledgeCheck({ project })).rejects.toThrow(/app\/Missing\.php/);
    });
  });

  test("checks learning key file references", async () => {
    await withProject(async (project) => {
      await capture(async () => knowledgeLearning("Billing Renewal Race", { project }));
      writeFileSync(
        join(project, `docs/knowledge/learnings/${today()}-billing-renewal-race.md`),
        `---
title: Billing Renewal Race
feature: billing
related_features: []
key_files:
  - app/Missing.php
fixed_in:
last_verified: 2026-06-08
---
`,
      );

      await expect(knowledgeCheck({ project })).rejects.toThrow(/app\/Missing\.php/);
    });
  });
});
