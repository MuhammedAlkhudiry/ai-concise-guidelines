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
    repository: "https://github.com/expo/skills.git",
    ref: "main",
    skills: [
      {
        name: "upgrading-expo",
        sourcePath: "plugins/expo/skills/upgrading-expo",
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
    repository: "https://github.com/callstackincubator/agent-device.git",
    ref: "main",
    skills: [
      {
        name: "agent-device",
        sourcePath: "skills/agent-device",
      },
    ],
  },
  {
    repository: "https://github.com/PostHog/ai-plugin.git",
    ref: "main",
    skills: [
      {
        name: "querying-posthog-data",
        sourcePath: "skills/querying-posthog-data",
      },
      {
        name: "investigate-metric",
        sourcePath: "skills/investigate-metric",
      },
      {
        name: "diagnosing-sdk-health",
        sourcePath: "skills/diagnosing-sdk-health",
      },
    ],
  },
  {
    repository: "https://github.com/getsentry/cli.git",
    ref: "main",
    skills: [
      {
        name: "sentry-cli",
        sourcePath: "plugins/sentry-cli/skills/sentry-cli",
      },
    ],
  },
  {
    repository: "https://github.com/getsentry/sentry-for-ai.git",
    ref: "main",
    skills: [
      {
        name: "sentry-php-sdk",
        sourcePath: "skills/sentry-php-sdk",
      },
      {
        name: "sentry-react-sdk",
        sourcePath: "skills/sentry-react-sdk",
      },
      {
        name: "sentry-react-native-sdk",
        sourcePath: "skills/sentry-react-native-sdk",
      },
      {
        name: "sentry-sdk-upgrade",
        sourcePath: "skills/sentry-sdk-upgrade",
      },
    ],
  },
];
