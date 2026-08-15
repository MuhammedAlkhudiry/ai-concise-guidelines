import { expect, mock, test } from "bun:test";

import { siteStatus } from "./lane-services";
import type { Lane } from "./project-lanes";

test("retries a transient site failure before declaring it unreachable", async () => {
  let attempts = 0;
  const request = mock(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("The operation timed out");
    return new Response(null, { status: 200 });
  }) as unknown as typeof fetch;
  const lane = {
    id: "lane-1",
    project: { id: "awraq" },
  } as Lane;

  const status = await siteStatus(lane, 3_000, request);

  expect(request).toHaveBeenCalledTimes(2);
  expect(status).toMatchObject({ id: "site", state: "running" });
});
