import { expect, test } from "bun:test";

import { statusForPullRequest, summarizeChecks } from "./lane-ci";

test("summarizes pull request checks", () => {
  expect(summarizeChecks([])).toBe("none");
  expect(summarizeChecks([{ status: "IN_PROGRESS", conclusion: "" }])).toBe("running");
  expect(summarizeChecks([{ status: "COMPLETED", conclusion: "FAILURE" }])).toBe("failed");
  expect(summarizeChecks([{ state: "SUCCESS" }])).toBe("passing");
  expect(summarizeChecks([{ state: "PENDING" }])).toBe("running");
  expect(
    summarizeChecks([
      { status: "COMPLETED", conclusion: "SUCCESS" },
      { status: "COMPLETED", conclusion: "SKIPPED" },
    ]),
  ).toBe("passing");
});

test("preserves merged and closed pull-request identity", () => {
  const merged = statusForPullRequest("project", "lane-1", "feature/merged", {
    headRefName: "feature/merged",
    number: 42,
    state: "MERGED",
    mergedAt: "2026-08-01T00:00:00Z",
    url: "https://github.com/example/project/pull/42",
    statusCheckRollup: [{ status: "COMPLETED", conclusion: "SUCCESS" }],
  });
  const closed = statusForPullRequest("project", "lane-2", "feature/closed", {
    headRefName: "feature/closed",
    number: 43,
    state: "CLOSED",
    url: "https://github.com/example/project/pull/43",
    statusCheckRollup: [],
  });

  expect(merged).toMatchObject({ state: "merged", number: 42 });
  expect(closed).toMatchObject({ state: "closed", number: 43 });
});
