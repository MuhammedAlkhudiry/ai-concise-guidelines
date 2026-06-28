import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

export interface LocalSkill {
  name: string;
  description: string;
  category: string;
  dir: string;
  skillPath: string;
  lineCount: number;
}

interface SkillFrontmatter {
  name: string;
  description: string;
}

interface SkillDiscoveryOptions {
  reportWarning?: (message: string) => void;
}

const DEFAULT_CATEGORY = "uncategorized";
const SKILL_LINE_WARNING_LIMIT = 68;
const SKILL_LINE_ERROR_LIMIT = 75;

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

function countLines(content: string): number {
  if (!content) {
    return 0;
  }

  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lineCount = normalizedContent.split("\n").length;
  return normalizedContent.endsWith("\n") ? lineCount - 1 : lineCount;
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

function validateSkillLineCount(
  skillsRoot: string,
  skillPath: string,
  lineCount: number,
  options: SkillDiscoveryOptions,
): void {
  if (lineCount < SKILL_LINE_WARNING_LIMIT) {
    return;
  }

  const relativePath = relative(skillsRoot, skillPath);

  if (lineCount > SKILL_LINE_ERROR_LIMIT) {
    throw new Error(
      `Skill exceeds ${SKILL_LINE_ERROR_LIMIT} line limit: ${relativePath} has ${lineCount} lines`,
    );
  }

  options.reportWarning?.(
    `Skill is near ${SKILL_LINE_ERROR_LIMIT} line limit: ${relativePath} has ${lineCount} lines`,
  );
}

export function discoverLocalSkills(
  skillsRoot: string,
  options: SkillDiscoveryOptions = { reportWarning: console.warn },
): LocalSkill[] {
  const skills = findSkillPaths(skillsRoot).map((skillPath) => {
    const dir = dirname(skillPath);
    const content = readFileSync(skillPath, "utf-8");
    const frontmatter = parseSkillFrontmatter(content, skillPath);
    const lineCount = countLines(content);

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
      lineCount,
    };
  });

  for (const skill of skills) {
    validateSkillLineCount(skillsRoot, skill.skillPath, skill.lineCount, options);
  }

  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.name)) {
      throw new Error(`Duplicate local skill name: ${skill.name}`);
    }
    seen.add(skill.name);
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}
