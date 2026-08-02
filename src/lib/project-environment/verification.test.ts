import { expect, test } from "bun:test";

import { shouldVerifyLiveServices } from "./verification";

test("skips live services only when the orchestrator explicitly disables them", () => {
  expect(shouldVerifyLiveServices({})).toBe(true);
  expect(shouldVerifyLiveServices({ PROJECT_LANE_VERIFY_LIVE_SERVICES: "1" })).toBe(true);
  expect(shouldVerifyLiveServices({ PROJECT_LANE_VERIFY_LIVE_SERVICES: "0" })).toBe(false);
});
