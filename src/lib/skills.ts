import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

export interface LocalSkill {
  name: string;
  description: string;
  category: string;
  dir: string;
  skillPath: string;
}

interface SkillFrontmatter {
  name: string;
  description: string;
}

const DEFAULT_CATEGORY = "uncategorized";

function parseSkillFrontmatter(content: string, skillPath: string): SkillFrontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`Skill is missing YAML frontmatter: ${skillPath}`);
  }

  const values = new Map<string, string>();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!field) {
      continue;
    }
    values.set(field[1], field[2].replace(/^["']|["']$/g, ""));
  }

  const name = values.get("name");
  const description = values.get("description");
  if (!name || !description) {
    throw new Error(`Skill frontmatter needs name and description: ${skillPath}`);
  }

  return { name, description };
}

function findSkillPaths(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const skillPath = join(dir, "SKILL.md");
  if (existsSync(skillPath)) {
    return [skillPath];
  }

  return readdirSync(dir)
    .map((entry) => join(dir, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory())
    .flatMap((entryPath) => findSkillPaths(entryPath));
}

function skillCategory(skillsRoot: string, skillDir: string): string {
  const parts = relative(skillsRoot, skillDir).split(sep).filter(Boolean);
  return parts.length > 1 ? parts[0] : DEFAULT_CATEGORY;
}

export function discoverLocalSkills(skillsRoot: string): LocalSkill[] {
  const skills = findSkillPaths(skillsRoot).map((skillPath) => {
    const dir = dirname(skillPath);
    const frontmatter = parseSkillFrontmatter(readFileSync(skillPath, "utf-8"), skillPath);

    if (basename(dir) !== frontmatter.name) {
      throw new Error(
        `Skill folder name must match frontmatter name: ${skillPath} has name ${frontmatter.name}`,
      );
    }

    return {
      ...frontmatter,
      category: skillCategory(skillsRoot, dir),
      dir,
      skillPath,
    };
  });

  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.name)) {
      throw new Error(`Duplicate local skill name: ${skill.name}`);
    }
    seen.add(skill.name);
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}
