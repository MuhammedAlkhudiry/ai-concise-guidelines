import { describe, expect, test } from "bun:test";

import { adsProjects, parsePeriod, parsePlatform, parseProject } from "./ads";

describe("ads CLI contract inputs", () => {
  test("normalizes supported platform aliases", () => {
    expect(parsePlatform("Google Ads")).toBe("google");
    expect(parsePlatform("facebook")).toBe("meta");
    expect(parsePlatform("Snap")).toBe("snapchat");
    expect(parsePlatform("TikTok Ads")).toBe("tiktok");
  });

  test("rejects unknown platforms and reporting periods", () => {
    expect(() => parsePlatform("linkedin")).toThrow("Unknown platform");
    expect(() => parsePeriod("14d")).toThrow('Period must be "7d" or "30d".');
  });

  test("exposes explicit project mappings and rejects unknown projects", () => {
    expect(adsProjects().projects.map(({ id }) => id)).toEqual([
      "awraq",
      "harium",
      "needs-classification",
    ]);
    expect(parseProject("all")).toBeUndefined();
    expect(parseProject("awraq")).toBe("awraq");
    expect(() => parseProject("unknown")).toThrow("Unknown project");
  });
});
