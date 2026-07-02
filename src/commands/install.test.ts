import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "bun:test";

import { syncManagedSkillsAsync } from "./install";

async function withTempDirs(run: (src: string, dest: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "my-setup-install-"));
  try {
    await run(join(root, "src"), join(root, "dest"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeSkill(root: string, category: string, name: string): void {
  const dir = join(root, category, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "SKILL.md"),
    [
      "---",
      `name: ${name}`,
      `description: Example ${name} skill.`,
      "---",
      "",
      `# ${name}`,
      "",
    ].join("\n"),
  );
}

describe("syncManagedSkillsAsync", () => {
  test("removes invalid installed skill directories and empty directories", async () => {
    await withTempDirs(async (src, dest) => {
      writeSkill(src, "tools", "typescript");
      mkdirSync(join(src, "tools", "typescript", "empty-source-dir"), { recursive: true });

      mkdirSync(join(dest, "draft-without-skill-md"), { recursive: true });
      writeFileSync(join(dest, "draft-without-skill-md", "notes.md"), "draft\n");
      mkdirSync(join(dest, "custom-valid-skill"), { recursive: true });
      mkdirSync(join(dest, "custom-valid-skill", "empty-custom-dir"), { recursive: true });
      writeFileSync(
        join(dest, "custom-valid-skill", "SKILL.md"),
        "---\nname: custom-valid-skill\ndescription: Custom valid skill.\n---\n",
      );

      await syncManagedSkillsAsync({ src, dest, label: "test skills" });

      expect(existsSync(join(dest, "draft-without-skill-md"))).toBe(false);
      expect(existsSync(join(dest, "custom-valid-skill", "empty-custom-dir"))).toBe(false);
      expect(existsSync(join(dest, "custom-valid-skill", "SKILL.md"))).toBe(true);
      expect(existsSync(join(dest, "typescript", "empty-source-dir"))).toBe(false);
      expect(existsSync(join(dest, "typescript", "SKILL.md"))).toBe(true);
    });
  });
});
