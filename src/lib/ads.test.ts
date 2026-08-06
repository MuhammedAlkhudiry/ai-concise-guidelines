import { describe, expect, test } from "bun:test";

import {
  adsProjects,
  adsStats,
  adsStatus,
  parseCampaign,
  parsePeriod,
  parsePlatform,
  parseProject,
} from "./ads";

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

  test("accepts provider campaign IDs and rejects unsafe filters", () => {
    expect(parseCampaign(123456789)).toBe("123456789");
    expect(parseCampaign("123456789")).toBe("123456789");
    expect(parseCampaign("2d3798dd-26c2-4e4e-b750-c246cfe8a36d")).toBe(
      "2d3798dd-26c2-4e4e-b750-c246cfe8a36d",
    );
    expect(parseCampaign("all")).toBeUndefined();
    expect(() => parseCampaign("123 OR 1=1")).toThrow("Campaign ID may contain only");
  });

  test("requires a platform when filtering stats by campaign", async () => {
    await expect(adsStats({ period: "7d", campaign: "123456789" })).rejects.toThrow(
      "requires one platform",
    );
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
