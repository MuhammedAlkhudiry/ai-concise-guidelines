/**
 * Auditor configurations
 * All auditors are subagents using auditor model (except frontend-ui-ux which needs vision)
 */

import { type AgentConfig } from "./agents";

// Just name → description. Config is derived.
const AUDITOR_DESCRIPTIONS: Record<string, string> = {
  "test-coverage": "Audits test coverage, missing cases, edge cases",
  "integration": "Audits backend↔frontend integration, API contracts",
  "backend": "Audits backend code quality, performance, database, security",
  "frontend-ui-ux": "Audits frontend code quality, UI/UX, forms, state, translations",
};

const AUDITOR_ADDITIONAL: AgentConfig["additional"] = {
  reasoningEffort: "medium",
};

// Special model overrides (default is "auditor")
const MODEL_OVERRIDES: Record<string, AgentConfig["model"]> = {
  "frontend-ui-ux": "ui_reviewer", // needs vision
};

// Generate full auditor configs
export const AUDITORS: Record<string, AgentConfig> = Object.fromEntries(
  Object.entries(AUDITOR_DESCRIPTIONS).map(([name, description]) => [
    `auditor-${name}`,
    {
      instruction: `auditing/auditor-${name}`,
      description,
      model: MODEL_OVERRIDES[name] ?? "auditor",
      additional: AUDITOR_ADDITIONAL,
      type: "sub" as const,
    },
  ])
);
