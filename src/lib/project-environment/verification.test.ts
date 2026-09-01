import { expect, test } from "bun:test";

import { shouldVerifyLiveServices, verifyViteHotOrigin } from "./verification";
import type { ProjectEnvironmentContext } from "./types";

test("skips live services only when the orchestrator explicitly disables them", () => {
  expect(shouldVerifyLiveServices({})).toBe(true);
  expect(shouldVerifyLiveServices({ PROJECT_LANE_VERIFY_LIVE_SERVICES: "1" })).toBe(true);
  expect(shouldVerifyLiveServices({ PROJECT_LANE_VERIFY_LIVE_SERVICES: "0" })).toBe(false);
});

test("requires the Vite hot origin to use the assigned lane port", () => {
  const context = {
    appUrl: "https://example-lane-3.test",
    vitePort: "7103",
  } as ProjectEnvironmentContext;

  expect(() => verifyViteHotOrigin(context, new URL("https://example-lane-3.test:7102"))).toThrow(
    "Vite hot origin must use lane port 7103",
  );
  expect(() =>
    verifyViteHotOrigin(context, new URL("https://example-lane-3.test:7103")),
  ).not.toThrow();
});
