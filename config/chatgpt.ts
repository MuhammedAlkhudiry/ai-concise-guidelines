export const CHATGPT_PLUGIN = {
  name: "my-setup",
  version: "0.1.0",
  description:
    "Personal knowledge, work briefs, UX/UI decisions, interviews, workshops, and writing guidance.",
  includedSkills: [
    "personal-knowledge",
    "work-brief",
    "ux-ui",
    "interview",
    "workshop",
    "how-to-write",
  ],
  author: {
    name: "Muhammed Alkhudiry",
    url: "https://github.com/MuhammedAlkhudiry",
  },
  repository: "https://github.com/MuhammedAlkhudiry/my-setup",
  privacyPolicy: "https://github.com/MuhammedAlkhudiry/my-setup/blob/main/docs/plugin/privacy.md",
  termsOfService: "https://github.com/MuhammedAlkhudiry/my-setup/blob/main/docs/plugin/terms.md",
  support: "https://github.com/MuhammedAlkhudiry/my-setup/issues",
  interface: {
    displayName: "Muhammed's Workflows",
    shortDescription: "Personal knowledge, work briefs, UX/UI decisions, and clear writing.",
    longDescription:
      "An opinionated set of reusable workflows for working with personal knowledge, shaping work briefs, reviewing UX/UI, interviewing, testing ideas, and writing clearly. Connect GitHub to use a private knowledge repository.",
    developerName: "Muhammed Alkhudiry",
    category: "Productivity",
    capabilities: ["Skills"],
    defaultPrompt: [
      "Find what I know about this topic in my connected knowledge repository.",
      "Turn this idea into a focused work brief.",
      "Review this interface and recommend the strongest direction.",
    ],
  },
} as const;
