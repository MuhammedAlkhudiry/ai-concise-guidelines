import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "bun:test";

import { CHATGPT_PLUGIN } from "../../config/chatgpt";
import { buildChatgptSkills } from "./chatgpt-skills";

function writeSkill(root: string, category: string, name: string): void {
  const directory = join(root, category, name);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${name} description.\n---\n`,
  );
}

describe("buildChatgptSkills", () => {
  test("builds only the explicit ChatGPT skill allowlist", async () => {
    const root = await mkdtemp(join(tmpdir(), "my-setup-chatgpt-"));
    const skillsRoot = join(root, "skills");
    const destinationRoot = join(root, "output");

    try {
      for (const skillName of CHATGPT_PLUGIN.includedSkills) {
        writeSkill(skillsRoot, "workflow", skillName);
      }
      writeSkill(skillsRoot, "tools", "claude-code");

      const result = await buildChatgptSkills(skillsRoot, destinationRoot);
      const manifest = JSON.parse(
        readFileSync(join(result.pluginPath, ".codex-plugin", "plugin.json"), "utf8"),
      ) as { name: string; skills: string };

      expect(result.skillNames).toEqual([...CHATGPT_PLUGIN.includedSkills].sort());
      expect(result.uploadPaths).toHaveLength(CHATGPT_PLUGIN.includedSkills.length);
      expect(existsSync(result.pluginArchivePath)).toBe(true);
      expect(existsSync(result.uploadPaths[0])).toBe(true);
      expect(existsSync(join(result.pluginPath, "skills", "workshop", "SKILL.md"))).toBe(true);
      expect(existsSync(join(result.pluginPath, "skills", "claude-code"))).toBe(false);
      expect(manifest).toMatchObject({ name: "my-setup", skills: "./skills/" });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("fails when an allowlisted skill is unavailable", async () => {
    const root = await mkdtemp(join(tmpdir(), "my-setup-chatgpt-"));
    try {
      expect(
        buildChatgptSkills(join(root, "skills"), join(root, "output"), ["workshop"]),
      ).rejects.toThrow("ChatGPT plugin skills are unavailable");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
