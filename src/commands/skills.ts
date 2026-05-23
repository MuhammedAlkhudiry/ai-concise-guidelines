import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { discoverLocalSkills, type LocalSkill } from "../lib/skills";

const ROOT_DIR = join(import.meta.dir, "..", "..");
const SKILLS_ROOT = join(ROOT_DIR, "content", "skills");

interface SkillCommandOptions {
  category?: string;
  skill?: string;
  format?: string;
}

function filterSkills(options: SkillCommandOptions): LocalSkill[] {
  return discoverLocalSkills(SKILLS_ROOT).filter((skill) => {
    if (options.category && skill.category !== options.category) {
      return false;
    }
    if (options.skill && skill.name !== options.skill) {
      return false;
    }
    return true;
  });
}

export function skillsOverview(options: SkillCommandOptions): void {
  const skills = filterSkills(options);

  if (options.format === "json") {
    console.log(JSON.stringify(skills, null, 2));
    return;
  }

  let currentCategory = "";
  for (const skill of skills.sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    return categoryCompare || a.name.localeCompare(b.name);
  })) {
    if (skill.category !== currentCategory) {
      currentCategory = skill.category;
      console.log(`\n## ${currentCategory}`);
    }
    console.log(`- ${skill.name}: ${skill.description}`);
  }
}

export async function skillsDump(options: SkillCommandOptions): Promise<void> {
  const skills = filterSkills(options);

  if (options.format === "json") {
    const records = await Promise.all(
      skills.map(async (skill) => ({
        ...skill,
        relativePath: relative(ROOT_DIR, skill.skillPath),
        content: await readFile(skill.skillPath, "utf-8"),
      })),
    );
    console.log(JSON.stringify(records, null, 2));
    return;
  }

  for (const skill of skills) {
    console.log(`# ${skill.name}`);
    console.log(`Category: ${skill.category}`);
    console.log(`Path: ${relative(ROOT_DIR, skill.skillPath)}`);
    console.log();
    console.log(await readFile(skill.skillPath, "utf-8"));
    console.log();
  }
}
