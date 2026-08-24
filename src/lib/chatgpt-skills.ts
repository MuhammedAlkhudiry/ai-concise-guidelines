import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { execa } from "execa";

import { CHATGPT_PLUGIN } from "../../config/chatgpt";
import { OPTIONAL_EXTERNAL_SKILL_NAMES } from "../../config/skills";
import { copyDirAsync, ensureDir } from "./fs";
import { discoverLocalSkills } from "./skills";

export interface ChatgptSkillsBuildResult {
  pluginArchivePath: string;
  pluginPath: string;
  uploadPaths: string[];
  skillNames: string[];
}

export async function buildChatgptSkills(
  skillsRoot: string,
  destinationRoot: string,
  includedSkillNames?: readonly string[],
): Promise<ChatgptSkillsBuildResult> {
  const pluginPath = join(destinationRoot, CHATGPT_PLUGIN.name);
  const pluginArchivePath = join(destinationRoot, `${CHATGPT_PLUGIN.name}.zip`);
  const pluginSkillsPath = join(pluginPath, "skills");
  const uploadsPath = join(destinationRoot, "uploads");
  const availableSkills = includedSkillNames ? new Set(includedSkillNames) : undefined;
  const unavailableSkills = availableSkills
    ? CHATGPT_PLUGIN.includedSkills.filter((skillName) => !availableSkills.has(skillName))
    : [];
  if (unavailableSkills.length > 0) {
    throw new Error(`ChatGPT plugin skills are unavailable: ${unavailableSkills.join(", ")}`);
  }

  const skills = discoverLocalSkills(skillsRoot, {
    additionalSkillNames: OPTIONAL_EXTERNAL_SKILL_NAMES,
    includedSkillNames: CHATGPT_PLUGIN.includedSkills,
  });

  await ensureDir(pluginSkillsPath);
  await ensureDir(uploadsPath);
  await mkdir(join(pluginPath, ".codex-plugin"), { recursive: true });

  const manifest = {
    name: CHATGPT_PLUGIN.name,
    version: CHATGPT_PLUGIN.version,
    description: CHATGPT_PLUGIN.description,
    author: CHATGPT_PLUGIN.author,
    homepage: CHATGPT_PLUGIN.repository,
    repository: CHATGPT_PLUGIN.repository,
    keywords: ["skills", "workflows", "productivity"],
    skills: "./skills/",
    interface: {
      ...CHATGPT_PLUGIN.interface,
      websiteURL: CHATGPT_PLUGIN.repository,
      privacyPolicyURL: CHATGPT_PLUGIN.privacyPolicy,
      termsOfServiceURL: CHATGPT_PLUGIN.termsOfService,
    },
  };

  await writeFile(
    join(pluginPath, ".codex-plugin", "plugin.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  for (const skill of skills) {
    const destination = join(pluginSkillsPath, skill.name);
    await copyDirAsync({
      src: skill.dir,
      dest: destination,
    });
    await rm(join(destination, "agents"), { recursive: true, force: true });
  }

  const uploadPaths = await Promise.all(
    skills.map(async (skill) => {
      const uploadPath = join(uploadsPath, `${skill.name}.zip`);
      await execa("zip", ["-q", "-r", uploadPath, skill.name], {
        cwd: pluginSkillsPath,
      });
      return uploadPath;
    }),
  );

  await rm(pluginArchivePath, { force: true });
  await execa("zip", ["-q", "-r", pluginArchivePath, CHATGPT_PLUGIN.name], {
    cwd: destinationRoot,
  });

  return {
    pluginArchivePath,
    pluginPath,
    uploadPaths,
    skillNames: skills.map((skill) => skill.name),
  };
}
