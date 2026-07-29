import { expect, test } from "bun:test";

import {
  assertAlwaysEnabledServices,
  assertSimSlimProfile,
  alwaysEnabledLabels,
  expectedDisabledLabels,
  parseDisabledLaunchdLabels,
  simSlimOffArgs,
  simSlimOnArgs,
  type SimSlimCategory,
  type SimSlimStatus,
} from "./simslim";

const categories: SimSlimCategory[] = [
  { id: "icloud", labels: ["com.apple.icloud"] },
  { id: "store", labels: ["com.apple.store", "com.apple.receipts"] },
  {
    id: "media",
    labels: ["com.apple.music"],
    alwaysEnabled: [{ label: "com.apple.sharingd", reason: "Required for share sheets" }],
  },
];

test("builds safe, full, and restore commands without changing boot state", () => {
  expect(
    simSlimOnArgs(
      "lane-1",
      { exceptCategories: ["icloud", "store"], keepServices: ["com.apple.music"] },
      true,
    ),
  ).toEqual([
    "on",
    "lane-1",
    "--except",
    "icloud,store",
    "--keep",
    "com.apple.music",
    "--preserve-boot-state",
  ]);
  expect(simSlimOnArgs("lane-1", { exceptCategories: [], keepServices: [] }, true)).toEqual([
    "on",
    "lane-1",
    "--preserve-boot-state",
  ]);
  expect(simSlimOffArgs("lane-1", true)).toEqual(["off", "lane-1", "--preserve-boot-state"]);
});

test("verifies the exact disabled service set for a project profile", () => {
  const profile = { exceptCategories: ["icloud"], keepServices: ["com.apple.receipts"] };
  const status: SimSlimStatus = {
    managedDisabled: 2,
    managedTotal: 4,
    booted: true,
    verdict: "partially slim",
    dropped: [
      {
        id: "store",
        name: "Store",
        downside: "Store unavailable",
        labels: ["com.apple.store"],
      },
      {
        id: "media",
        name: "Media",
        downside: "Music unavailable",
        labels: ["com.apple.music"],
      },
    ],
  };

  expect(expectedDisabledLabels(categories, profile)).toEqual([
    "com.apple.music",
    "com.apple.store",
  ]);
  expect(() => assertSimSlimProfile(categories, status, profile)).not.toThrow();

  status.dropped[0]!.labels.push("com.apple.receipts");
  expect(() => assertSimSlimProfile(categories, status, profile)).toThrow(
    "unexpected: com.apple.receipts",
  );
});

test("rejects profile entries that SimSlim does not manage", () => {
  expect(() =>
    expectedDisabledLabels(categories, {
      exceptCategories: ["unknown"],
      keepServices: [],
    }),
  ).toThrow("Unknown SimSlim categories: unknown");
});

test("detects legacy disabled services that current profiles always enable", () => {
  const disabled = parseDisabledLaunchdLabels(`
    "com.apple.music" => disabled
    "com.apple.sharingd" => true
    "com.apple.store" => enabled
  `);

  expect(alwaysEnabledLabels(categories)).toEqual(["com.apple.sharingd"]);
  expect(disabled).toEqual(["com.apple.music", "com.apple.sharingd"]);
  expect(() => assertAlwaysEnabledServices(categories, disabled)).toThrow(
    "Required SimSlim services disabled: com.apple.sharingd",
  );
  expect(() => assertAlwaysEnabledServices(categories, ["com.apple.music"])).not.toThrow();
});
