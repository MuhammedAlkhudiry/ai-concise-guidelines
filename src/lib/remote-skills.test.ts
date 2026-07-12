import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "bun:test";

import type { RemoteSkillSource } from "../../config/skills";
import { getRemoteSkillRefreshDecision, recordRemoteSkillRefresh } from "./remote-skills";

const roots: string[] = [];

const sources: RemoteSkillSource[] = [
  {
    repository: "https://example.com/skills.git",
    ref: "main",
    skills: [{ name: "example-skill", sourcePath: "skills/example-skill" }],
  },
];

async function createFixture(): Promise<{ root: string; skillsDir: string; statePath: string }> {
  const root = await mkdtemp(join(tmpdir(), "my-setup-remote-skills-"));
  const skillsDir = join(root, "skills");
  const statePath = join(root, "state/remote-skills.json");
  const skillDir = join(skillsDir, "example-skill");
  roots.push(root);

  await mkdir(skillDir, { recursive: true });
  await writeFile(
    join(skillDir, "SKILL.md"),
    "---\nname: example-skill\ndescription: Test.\n---\n",
  );

  return { root, skillsDir, statePath };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("remote skill refresh policy", () => {
  test("skips a complete matching refresh for 24 hours", async () => {
    const { skillsDir, statePath } = await createFixture();
    const refreshedAt = new Date("2026-07-11T00:00:00.000Z");
    await recordRemoteSkillRefresh(sources, statePath, refreshedAt);

    expect(
      await getRemoteSkillRefreshDecision({
        sources,
        skillsDir,
        statePath,
        now: new Date("2026-07-11T23:59:59.999Z"),
      }),
    ).toEqual({ refresh: false, reason: "fresh" });

    expect(
      await getRemoteSkillRefreshDecision({
        sources,
        skillsDir,
        statePath,
        now: new Date("2026-07-12T00:00:00.000Z"),
      }),
    ).toEqual({ refresh: true, reason: "stale" });
  });

  test("refreshes when forced, sources change, or an installed skill is missing", async () => {
    const { root, skillsDir, statePath } = await createFixture();
    const now = new Date("2026-07-11T12:00:00.000Z");
    await recordRemoteSkillRefresh(sources, statePath, now);

    expect(
      await getRemoteSkillRefreshDecision({ sources, skillsDir, statePath, force: true, now }),
    ).toEqual({ refresh: true, reason: "forced" });

    const changedSources = [{ ...sources[0], ref: "next" }];
    expect(
      await getRemoteSkillRefreshDecision({
        sources: changedSources,
        skillsDir,
        statePath,
        now,
      }),
    ).toEqual({ refresh: true, reason: "sources-changed" });

    await rm(join(root, "skills/example-skill"), { recursive: true, force: true });
    expect(await getRemoteSkillRefreshDecision({ sources, skillsDir, statePath, now })).toEqual({
      refresh: true,
      reason: "missing-skill",
    });
  });
});
