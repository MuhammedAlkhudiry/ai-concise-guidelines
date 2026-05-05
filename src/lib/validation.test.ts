import { describe, expect, test } from "bun:test";

import { validateRemoteSkillSources } from "./validation";

describe("validateRemoteSkillSources", () => {
  test("accepts valid remote skill declarations", () => {
    const sources = validateRemoteSkillSources([
      {
        repository: "https://github.com/example/repo.git",
        ref: "main",
        skills: [
          {
            name: "example",
            sourcePath: "skills/example",
          },
        ],
      },
    ]);

    expect(sources[0]?.skills[0]?.name).toBe("example");
  });

  test("rejects invalid repository URLs", () => {
    expect(() =>
      validateRemoteSkillSources([
        {
          repository: "not-a-url",
          ref: "main",
          skills: [
            {
              name: "example",
              sourcePath: "skills/example",
            },
          ],
        },
      ]),
    ).toThrow();
  });
});
