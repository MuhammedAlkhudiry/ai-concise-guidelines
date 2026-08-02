import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { describe, expect, test } from "bun:test";

const script = join(dirname(fileURLToPath(import.meta.url)), "lanes-cli.ts");

function writePlan(root: string, project: string, file: string, title: string): void {
  const projectRoot = join(root, project);
  mkdirSync(projectRoot, { recursive: true });
  writeFileSync(
    join(projectRoot, file),
    [
      "---",
      "created: 2026-06-01",
      "updated: 2026-06-02",
      `project: ${project}`,
      `description: ${title} summary`,
      "---",
      "",
      `# ${title}`,
      "",
    ].join("\n"),
  );
}

describe("lanes plans list", () => {
  test("uses the configured project id inside a lane clone", () => {
    const fixture = mkdtempSync(join(tmpdir(), "lanes-plans-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project-lane-1");
    const lanesConfig = join(fixture, "lanes.json");

    try {
      mkdirSync(checkout, { recursive: true });
      spawnSync("git", ["init"], { cwd: checkout });
      spawnSync(
        "git",
        ["remote", "add", "origin", "git@github.com:owner/example-project-repository.git"],
        { cwd: checkout },
      );
      writeFileSync(
        lanesConfig,
        JSON.stringify({
          version: 4,
          projects: [
            {
              id: "example-project",
              name: "Example Project",
              remoteUrl: "https://example.com/example-project-repository.git",
              baseBranch: "main",
              lanePathPattern: join(fixture, "example-project-lane-{number}"),
              lanes: [{ number: 1, path: checkout }],
              environmentVariable: "EXAMPLE_PROJECT_LANE_ROOT",
              services: [
                {
                  id: "frontend",
                  name: "Frontend",
                  directory: "app",
                  runner: { type: "bun-script", script: "dev" },
                },
              ],
            },
          ],
        }),
      );
      writePlan(plansRoot, "example-project", "base.md", "Base Plan");
      writePlan(plansRoot, "example-project-repository", "remote.md", "Remote Plan");
      writePlan(plansRoot, "other-project", "other.md", "Other Plan");

      const result = spawnSync("bun", [script, "plans", "list", `--plans-root=${plansRoot}`], {
        cwd: checkout,
        encoding: "utf8",
        env: { ...process.env, LANES_CONFIG_PATH: lanesConfig },
      });

      expect(result.status).toBe(0);
      expect(result.stdout).not.toContain("Projects:");
      expect(result.stdout).toContain("base.md");
      expect(result.stdout).not.toContain("remote.md");
      expect(result.stdout).not.toContain("other.md");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("falls back to the Git remote for an unconfigured repository", () => {
    const fixture = mkdtempSync(join(tmpdir(), "lanes-plans-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "unconfigured-checkout");

    try {
      mkdirSync(checkout, { recursive: true });
      spawnSync("git", ["init"], { cwd: checkout });
      spawnSync("git", ["remote", "add", "origin", "git@github.com:owner/example-project.git"], {
        cwd: checkout,
      });
      writePlan(plansRoot, "example-project", "remote.md", "Remote Plan");

      const result = spawnSync("bun", [script, "plans", "list", `--plans-root=${plansRoot}`], {
        cwd: checkout,
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("example-project plans");
      expect(result.stdout).toContain("remote.md");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("keeps explicit project listing scoped to that project", () => {
    const fixture = mkdtempSync(join(tmpdir(), "lanes-plans-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project");

    try {
      mkdirSync(checkout, { recursive: true });
      writePlan(plansRoot, "example-project", "base.md", "Base Plan");
      writePlan(plansRoot, "example-project-auth", "auth.md", "Auth Plan");

      const result = spawnSync(
        "bun",
        [script, "plans", "list", "--project=example-project", `--plans-root=${plansRoot}`],
        {
          cwd: checkout,
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).not.toContain("Projects:");
      expect(result.stdout).toContain("base.md");
      expect(result.stdout).not.toContain("auth.md");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});

describe("lanes plans archive", () => {
  test("archives the matching plan without changing frontmatter", () => {
    const fixture = mkdtempSync(join(tmpdir(), "lanes-plans-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project");
    const projectRoot = join(plansRoot, "example-project");

    try {
      mkdirSync(checkout, { recursive: true });
      writePlan(plansRoot, "example-project", "billing.md", "Billing Plan");
      writePlan(plansRoot, "example-project", "editor.md", "Editor Plan");

      const result = spawnSync(
        "bun",
        [script, "plans", "archive", "billing", `--plans-root=${plansRoot}`],
        {
          cwd: checkout,
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Archived 1 plan.");
      expect(result.stdout).toContain(join(projectRoot, "archive", "billing.md"));
      expect(result.stderr).toBe("");
      expect(existsSync(join(projectRoot, "billing.md"))).toBe(false);

      const archivedPlan = readFileSync(join(projectRoot, "archive", "billing.md"), "utf8");
      const index = readFileSync(join(projectRoot, "INDEX.md"), "utf8");

      expect(archivedPlan).not.toContain("status:");
      expect(index).toContain("editor.md");
      expect(index).not.toContain("billing.md");

      const list = spawnSync("bun", [script, "plans", "list", `--plans-root=${plansRoot}`], {
        cwd: checkout,
        encoding: "utf8",
      });

      expect(list.status).toBe(0);
      expect(list.stdout).toContain("editor.md");
      expect(list.stdout).not.toContain("billing.md");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
