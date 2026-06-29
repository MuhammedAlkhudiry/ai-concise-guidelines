import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { describe, expect, test } from "bun:test";

const script = join(dirname(fileURLToPath(import.meta.url)), "plan.ts");

function writePlan(root: string, project: string, file: string, title: string): void {
  const projectRoot = join(root, project);
  mkdirSync(projectRoot, { recursive: true });
  writeFileSync(
    join(projectRoot, file),
    [
      "---",
      "status: draft",
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

describe("plan list", () => {
  test("includes worktree-suffixed plan folders for the current project", () => {
    const fixture = mkdtempSync(join(tmpdir(), "plan-cli-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project");

    try {
      mkdirSync(checkout, { recursive: true });
      writePlan(plansRoot, "example-project", "base.md", "Base Plan");
      writePlan(plansRoot, "example-project-auth", "auth.md", "Auth Plan");
      writePlan(plansRoot, "example-project-editor", "editor.md", "Editor Plan");
      writePlan(plansRoot, "other-project", "other.md", "Other Plan");

      const result = spawnSync("bun", [script, "list", `--plans-root=${plansRoot}`], {
        cwd: checkout,
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "Projects: example-project, example-project-auth, example-project-editor",
      );
      expect(result.stdout).toContain("\nexample-project\n");
      expect(result.stdout).toContain("\nexample-project-auth\n");
      expect(result.stdout).toContain("\nexample-project-editor\n");
      expect(result.stdout).toContain("base.md");
      expect(result.stdout).toContain("auth.md");
      expect(result.stdout).toContain("editor.md");
      expect(result.stdout).not.toContain("example-project/base.md");
      expect(result.stdout).not.toContain("example-project-auth/auth.md");
      expect(result.stdout).not.toContain("example-project-editor/editor.md");
      expect(result.stdout).not.toContain("other-project/other.md");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("keeps explicit project listing scoped to that project", () => {
    const fixture = mkdtempSync(join(tmpdir(), "plan-cli-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project");

    try {
      mkdirSync(checkout, { recursive: true });
      writePlan(plansRoot, "example-project", "base.md", "Base Plan");
      writePlan(plansRoot, "example-project-auth", "auth.md", "Auth Plan");

      const result = spawnSync(
        "bun",
        [script, "list", "--project=example-project", `--plans-root=${plansRoot}`],
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
