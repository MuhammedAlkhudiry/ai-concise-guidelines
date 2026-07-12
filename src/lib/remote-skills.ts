import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { RemoteSkillSource } from "../../config/skills";
import { ensureParentDir } from "./fs";

const REMOTE_SKILL_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface RemoteSkillRefreshState {
  fingerprint: string;
  refreshedAt: string;
}

export type RemoteSkillRefreshReason =
  | "fresh"
  | "forced"
  | "missing-skill"
  | "missing-state"
  | "invalid-state"
  | "sources-changed"
  | "stale";

export interface RemoteSkillRefreshDecision {
  refresh: boolean;
  reason: RemoteSkillRefreshReason;
}

interface RemoteSkillRefreshOptions {
  sources: RemoteSkillSource[];
  skillsDir: string;
  statePath: string;
  force?: boolean;
  now?: Date;
}

function fingerprintSources(sources: RemoteSkillSource[]): string {
  return createHash("sha256").update(JSON.stringify(sources)).digest("hex");
}

function hasAllInstalledSkills(sources: RemoteSkillSource[], skillsDir: string): boolean {
  return sources.every((source) =>
    source.skills.every((skill) => existsSync(join(skillsDir, skill.name, "SKILL.md"))),
  );
}

function parseRefreshState(content: string): RemoteSkillRefreshState | undefined {
  try {
    const value: unknown = JSON.parse(content);
    if (!value || typeof value !== "object") {
      return undefined;
    }

    const state = value as Record<string, unknown>;
    if (typeof state.fingerprint !== "string" || typeof state.refreshedAt !== "string") {
      return undefined;
    }

    return {
      fingerprint: state.fingerprint,
      refreshedAt: state.refreshedAt,
    };
  } catch {
    return undefined;
  }
}

export async function getRemoteSkillRefreshDecision(
  options: RemoteSkillRefreshOptions,
): Promise<RemoteSkillRefreshDecision> {
  const { sources, skillsDir, statePath, force = false, now = new Date() } = options;

  if (force) {
    return { refresh: true, reason: "forced" };
  }

  if (!hasAllInstalledSkills(sources, skillsDir)) {
    return { refresh: true, reason: "missing-skill" };
  }

  if (!existsSync(statePath)) {
    return { refresh: true, reason: "missing-state" };
  }

  const state = parseRefreshState(await readFile(statePath, "utf-8"));
  if (!state) {
    return { refresh: true, reason: "invalid-state" };
  }

  if (state.fingerprint !== fingerprintSources(sources)) {
    return { refresh: true, reason: "sources-changed" };
  }

  const refreshedAt = Date.parse(state.refreshedAt);
  const age = now.getTime() - refreshedAt;
  if (!Number.isFinite(refreshedAt) || age < 0 || age >= REMOTE_SKILL_REFRESH_INTERVAL_MS) {
    return { refresh: true, reason: "stale" };
  }

  return { refresh: false, reason: "fresh" };
}

export async function recordRemoteSkillRefresh(
  sources: RemoteSkillSource[],
  statePath: string,
  refreshedAt = new Date(),
): Promise<void> {
  const state: RemoteSkillRefreshState = {
    fingerprint: fingerprintSources(sources),
    refreshedAt: refreshedAt.toISOString(),
  };

  await ensureParentDir(statePath);
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}
