import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "bun:test";

import { discoverLocalSkills } from "./skills";

function writeSkill(root: string, path: string, name: string): void {
  const dir = join(root, path, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "SKILL.md"),
    `---\nname: ${name}\ndescription: Example ${name} skill.\n---\n\n# ${name}\n`,
  );
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
});
