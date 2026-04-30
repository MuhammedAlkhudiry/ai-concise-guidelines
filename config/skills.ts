/**
 * Skill definitions shared by the installer.
 * Local skills live in content/skills. Remote skills are fetched fresh during install.
 */

export interface RemoteSkill {
  name: string;
  sourcePath: string;
}

export interface RemoteSkillSource {
  repository: string;
  ref: string;
  skills: RemoteSkill[];
}

export const REMOTE_SKILL_SOURCES: RemoteSkillSource[] = [
  {
    repository: "https://github.com/pbakaus/impeccable.git",
    ref: "main",
    skills: [
      {
        name: "impeccable",
        sourcePath: ".agents/skills/impeccable",
      },
    ],
  },
  {
    repository: "https://github.com/microsoft/playwright-cli.git",
    ref: "main",
    skills: [
      {
        name: "_playwright",
        sourcePath: "skills/playwright-cli",
      },
    ],
  },
  {
    repository: "https://github.com/vercel-labs/skills.git",
    ref: "main",
    skills: [
      {
        name: "find-skills",
        sourcePath: "skills/find-skills",
      },
    ],
  },
  {
    repository: "https://github.com/mattpocock/skills.git",
    ref: "main",
    skills: [
      {
        name: "grill-with-docs",
        sourcePath: "skills/engineering/grill-with-docs",
      },
    ],
  },
  {
    repository: "https://github.com/kepano/obsidian-skills.git",
    ref: "main",
    skills: [
      {
        name: "obsidian-cli",
        sourcePath: "skills/obsidian-cli",
      },
      {
        name: "obsidian-markdown",
        sourcePath: "skills/obsidian-markdown",
      },
      {
        name: "obsidian-bases",
        sourcePath: "skills/obsidian-bases",
      },
    ],
  },
];
