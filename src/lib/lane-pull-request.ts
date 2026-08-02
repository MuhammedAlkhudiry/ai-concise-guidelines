import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { execa } from "execa";
import { z } from "zod";

import { getActiveProjects, selectProjectLane } from "./project-lanes";

const generatedMetadataSchema = z.object({
  commitSubject: z.string().trim().min(1).max(72),
  commitBody: z.string().trim(),
  pullRequestTitle: z.string().trim().min(1).max(120),
  pullRequestBody: z.string().trim().min(1),
});

export interface CreatedPullRequest {
  project: string;
  lane: string;
  branch: string;
  url: string;
}

export type PullRequestCreationStage =
  | "inspecting"
  | "generating"
  | "committing"
  | "pushing"
  | "creating";

export async function createLanePullRequest(
  projectId: string,
  laneId: string,
  onProgress: (stage: PullRequestCreationStage) => void = () => {},
): Promise<CreatedPullRequest> {
  onProgress("inspecting");
  const lane = selectProjectLane(getActiveProjects(), { projectId, laneId });
  const branch = git(lane.path, ["branch", "--show-current"]);
  if (!branch) throw new Error(`${projectId}/${laneId} is in detached HEAD state`);
  if (branch === lane.project.baseBranch) {
    throw new Error(`Cannot create a pull request from the base branch ${branch}`);
  }
  const model = lane.project.pullRequest?.model;
  if (!model) {
    throw new Error(`Configure pullRequest.model for ${projectId} before creating pull requests`);
  }

  const repository = githubRepository(lane.project.remoteUrl);
  const gh = githubCli();
  const existing = await execa(
    gh,
    [
      "pr",
      "list",
      "--state",
      "all",
      "--head",
      branch,
      "--repo",
      repository,
      "--limit",
      "1",
      "--json",
      "url",
    ],
    { reject: false },
  );
  if (existing.exitCode !== 0) throw new Error(existing.stderr || "Could not query pull requests");
  const existingPullRequests = JSON.parse(existing.stdout) as Array<{ url: string }>;
  if (existingPullRequests[0]) {
    throw new Error(`Pull request already exists: ${existingPullRequests[0].url}`);
  }

  await execa("git", ["fetch", "origin", lane.project.baseBranch, "--quiet"], {
    cwd: lane.path,
  });
  const hasChanges = Boolean(git(lane.path, ["status", "--porcelain=v1", "--untracked-files=all"]));
  const ahead = Number(
    git(lane.path, ["rev-list", "--count", `origin/${lane.project.baseBranch}..HEAD`]),
  );
  if (!hasChanges && ahead === 0) {
    throw new Error(`No changes to propose against ${lane.project.baseBranch}`);
  }

  onProgress("generating");
  const metadata = await generatePullRequestMetadata(lane.path, lane.project.baseBranch, model);
  if (hasChanges) {
    onProgress("committing");
    await execa("git", ["add", "-A"], { cwd: lane.path });
    const commitArguments = ["commit", "-m", metadata.commitSubject];
    if (metadata.commitBody) commitArguments.push("-m", metadata.commitBody);
    await execa("git", commitArguments, { cwd: lane.path });
  }

  onProgress("pushing");
  await execa("git", ["push", "--set-upstream", "origin", branch], { cwd: lane.path });
  onProgress("creating");
  const created = await execa(
    gh,
    [
      "pr",
      "create",
      "--repo",
      repository,
      "--head",
      branch,
      "--base",
      lane.project.baseBranch,
      "--title",
      metadata.pullRequestTitle,
      "--body",
      metadata.pullRequestBody,
    ],
    { cwd: lane.path },
  );
  const url = created.stdout.trim();
  if (!url) throw new Error("GitHub did not return the created pull-request URL");
  return { project: projectId, lane: laneId, branch, url };
}

async function generatePullRequestMetadata(
  lanePath: string,
  baseBranch: string,
  model: string,
): Promise<z.infer<typeof generatedMetadataSchema>> {
  const root = mkdtempSync(join(tmpdir(), "lanes-pr-"));
  const schemaPath = join(root, "schema.json");
  const outputPath = join(root, "output.json");
  try {
    writeFileSync(
      schemaPath,
      JSON.stringify({
        type: "object",
        additionalProperties: false,
        required: ["commitSubject", "commitBody", "pullRequestTitle", "pullRequestBody"],
        properties: {
          commitSubject: { type: "string", minLength: 1, maxLength: 72 },
          commitBody: { type: "string" },
          pullRequestTitle: { type: "string", minLength: 1, maxLength: 120 },
          pullRequestBody: { type: "string", minLength: 1 },
        },
      }),
    );
    await execa(
      "codex",
      [
        "exec",
        "--ephemeral",
        "--ignore-user-config",
        "--ignore-rules",
        "--sandbox",
        "read-only",
        "--model",
        model,
        "--output-schema",
        schemaPath,
        "--output-last-message",
        outputPath,
        "--color",
        "never",
        "--cd",
        lanePath,
        `Inspect the current Git changes and commits relative to origin/${baseBranch}. Generate concise Git and pull-request metadata. The commit subject must be imperative and at most 72 characters. The pull-request body must contain Markdown sections named Summary, QA, and Test cases, with concrete human-run verification steps. Do not modify files, Git state, or external systems.`,
      ],
      { cwd: lanePath },
    );
    const metadata = generatedMetadataSchema.parse(JSON.parse(readFileSync(outputPath, "utf8")));
    if (!/^## QA$/im.test(metadata.pullRequestBody)) {
      throw new Error("Generated pull-request body is missing a QA section");
    }
    if (!/^## Test cases$/im.test(metadata.pullRequestBody)) {
      throw new Error("Generated pull-request body is missing a Test cases section");
    }
    return metadata;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function githubCli(): string {
  const executable = ["/opt/homebrew/bin/gh", "/usr/local/bin/gh"].find(existsSync);
  if (!executable) throw new Error("GitHub CLI is unavailable");
  return executable;
}

function githubRepository(remoteUrl: string): string {
  const url = new URL(remoteUrl);
  if (url.hostname !== "github.com") throw new Error(`Unsupported Git remote: ${remoteUrl}`);
  return url.pathname.replace(/^\//, "").replace(/\.git$/, "");
}
