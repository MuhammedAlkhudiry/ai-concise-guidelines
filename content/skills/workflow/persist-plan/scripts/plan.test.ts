import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { describe, expect, test } from "bun:test";

const script = join(dirname(fileURLToPath(import.meta.url)), "plan.ts");

function writePlan(
  root: string,
  project: string,
  file: string,
  title: string,
  status = "draft",
): void {
  const projectRoot = join(root, project);
  mkdirSync(projectRoot, { recursive: true });
  writeFileSync(
    join(projectRoot, file),
    [
      "---",
      `status: ${status}`,
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

describe("plan archive", () => {
  test("clears done plans without archiving active work", () => {
    const fixture = mkdtempSync(join(tmpdir(), "plan-cli-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project");
    const projectRoot = join(plansRoot, "example-project");

    try {
      mkdirSync(checkout, { recursive: true });
      writePlan(plansRoot, "example-project", "done.md", "Done Plan", "done");
      writePlan(plansRoot, "example-project", "draft.md", "Draft Plan", "draft");
      writePlan(plansRoot, "example-project", "approved.md", "Approved Plan", "approved");

      const result = spawnSync(
        "bun",
        [script, "archive", "--clear", `--plans-root=${plansRoot}`],
        {
          cwd: checkout,
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Archived 1 plan.");
      expect(result.stdout).toContain(join(projectRoot, "archive", "done.md"));
      expect(result.stderr).toBe("");
      expect(existsSync(join(projectRoot, "done.md"))).toBe(false);

      const archivedPlan = readFileSync(join(projectRoot, "archive", "done.md"), "utf8");
      const index = readFileSync(join(projectRoot, "INDEX.md"), "utf8");

      expect(archivedPlan).toContain("status: archived");
      expect(index).toContain("draft.md");
      expect(index).toContain("approved.md");
      expect(index).not.toContain("done.md");

      const list = spawnSync("bun", [script, "list", `--plans-root=${plansRoot}`], {
        cwd: checkout,
        encoding: "utf8",
      });

      expect(list.status).toBe(0);
      expect(list.stdout).toContain("draft.md");
      expect(list.stdout).toContain("approved.md");
      expect(list.stdout).not.toContain("done.md");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("reports when there are no done plans to clear", () => {
    const fixture = mkdtempSync(join(tmpdir(), "plan-cli-"));
    const plansRoot = join(fixture, "plans");
    const checkout = join(fixture, "example-project");

    try {
      mkdirSync(checkout, { recursive: true });
      writePlan(plansRoot, "example-project", "draft.md", "Draft Plan");

      const result = spawnSync(
        "bun",
        [script, "archive", "--clear", `--plans-root=${plansRoot}`],
        {
          cwd: checkout,
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("No done plans found.");
      expect(result.stderr).toBe("");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
