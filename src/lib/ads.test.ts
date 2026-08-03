import { describe, expect, test } from "bun:test";

import { adsProjects, adsStatus, parsePeriod, parsePlatform, parseProject } from "./ads";

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
    expect(adsProjects().projects.map(({ id }) => id)).toEqual(["awraq", "harium"]);
    expect(parseProject("all")).toBeUndefined();
    expect(parseProject("awraq")).toBe("awraq");
    expect(() => parseProject("unknown")).toThrow("Unknown project");
  });

  test("represents browser-only and pending project access accurately", async () => {
    const apple = await adsStatus({ platform: "apple", project: "awraq", refresh: true });
    const tiktok = await adsStatus({ platform: "tiktok", project: "awraq", refresh: true });

    expect(apple.platforms[0]).toMatchObject({
      state: "browser",
      configured: false,
      account: { id: "22534290" },
    });
    expect(tiktok.platforms[0]).toMatchObject({
      state: "pending",
      configured: false,
      account: { id: "7665783056824877073" },
    });
  });
});
