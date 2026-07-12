/**
 * Skill definitions shared by the installer.
 * Local skills live in content/skills. Remote skills refresh during install when their daily
 * cache expires, their declarations change, or an installed skill is missing.
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

// Remote skills intentionally track upstream branches so periodic refreshes update external
// agent guidance without a separate lockfile workflow.
export const REMOTE_SKILL_SOURCES: RemoteSkillSource[] = [
  {
    repository: "https://github.com/expo/skills.git",
    ref: "main",
    skills: [
      {
        name: "upgrading-expo",
        sourcePath: "plugins/expo/skills/expo-upgrade",
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
    repository: "https://github.com/getsentry/plugin-codex.git",
    ref: "main",
    skills: [
      {
        name: "sentry-get-started",
        sourcePath: "plugins/sentry/skills/sentry-get-started",
      },
      {
        name: "sentry-instrument",
        sourcePath: "plugins/sentry/skills/sentry-instrument",
      },
      {
        name: "sentry-sdk-upgrade",
        sourcePath: "plugins/sentry/skills/sentry-sdk-upgrade",
      },
    ],
  },
];
