/**
 * Skill definitions shared by the installer.
 * Local skills live in content/skills. Remote skills are fetched fresh during install.
 */

export interface RemoteSkill {
  name: string;
  repository: string;
  ref: string;
  sourcePath: string;
}

export const REMOTE_SKILLS: RemoteSkill[] = [
  {
    name: "impeccable",
    repository: "https://github.com/pbakaus/impeccable.git",
    ref: "main",
    sourcePath: ".agents/skills/impeccable",
  },
  {
    name: "_playwright",
    repository: "https://github.com/microsoft/playwright-cli.git",
    ref: "main",
    sourcePath: "skills/playwright-cli",
  },
  {
    name: "find-skills",
    repository: "https://github.com/vercel-labs/skills.git",
    ref: "main",
    sourcePath: "skills/find-skills",
  },
  {
    name: "grill-with-docs",
    repository: "https://github.com/mattpocock/skills.git",
    ref: "main",
    sourcePath: "skills/engineering/grill-with-docs",
  },
];
