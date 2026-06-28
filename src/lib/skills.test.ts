import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "bun:test";

import { discoverLocalSkills } from "./skills";

const ROOT_DIR = join(import.meta.dir, "..", "..");
const LOCAL_SKILLS_ROOT = join(ROOT_DIR, "content", "skills");

function skillContent(name: string, lineCount = 6): string {
  const lines = [
    "---",
    `name: ${name}`,
    `description: Example ${name} skill.`,
    "---",
    "",
    `# ${name}`,
  ];

  while (lines.length < lineCount) {
    lines.push(`Line ${lines.length + 1}`);
  }

  return lines.join("\n") + "\n";
}

function writeSkill(root: string, path: string, name: string, lineCount?: number): void {
  const dir = join(root, path, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), skillContent(name, lineCount));
}

describe("discoverLocalSkills", () => {
  test("discovers nested category skills", () => {
    const root = mkdtempSync(join(tmpdir(), "my-setup-skills-"));
    try {
      writeSkill(root, "tools", "laravel");
      writeSkill(root, "qa", "qa-handoff");

      const skills = discoverLocalSkills(root);

      expect(skills.map((skill) => skill.name)).toEqual(["laravel", "qa-handoff"]);
      expect(skills.find((skill) => skill.name === "laravel")?.category).toBe("tools");
      expect(skills.find((skill) => skill.name === "qa-handoff")?.category).toBe("qa");
      expect(skills.find((skill) => skill.name === "laravel")?.lineCount).toBe(6);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects folder and frontmatter name mismatch", () => {
    const root = mkdtempSync(join(tmpdir(), "my-setup-skills-"));
    try {
      const dir = join(root, "tools", "laravel");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "SKILL.md"), "---\nname: react\ndescription: Wrong name.\n---\n");

      expect(() => discoverLocalSkills(root)).toThrow(/folder name must match/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("warns when a skill is near the line limit", () => {
    const root = mkdtempSync(join(tmpdir(), "my-setup-skills-"));
    const warnings: string[] = [];
    try {
      writeSkill(root, "tools", "typescript", 68);

      discoverLocalSkills(root, { reportWarning: (message) => warnings.push(message) });

      expect(warnings).toEqual([
        "Skill is near 75 line limit: tools/typescript/SKILL.md has 68 lines",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects new skills over the line limit", () => {
    const root = mkdtempSync(join(tmpdir(), "my-setup-skills-"));
    try {
      writeSkill(root, "tools", "typescript", 76);

      expect(() => discoverLocalSkills(root, { reportWarning: () => {} })).toThrow(
        /Skill exceeds 75 line limit: tools\/typescript\/SKILL.md has 76 lines/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("keeps local source skills within the line limit policy", () => {
    expect(
      discoverLocalSkills(LOCAL_SKILLS_ROOT, { reportWarning: () => {} }).length,
    ).toBeGreaterThan(0);
  });
});
