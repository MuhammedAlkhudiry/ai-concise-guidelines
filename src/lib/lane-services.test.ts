import { expect, mock, test } from "bun:test";

import { broadcastMetroReload, siteStatus } from "./lane-services";
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

test("broadcasts Expo reload only when a native client is connected", async () => {
  let nativeConnected = true;
  let reloads = 0;
  const server = Bun.serve<{ role: "lanes" }>({
    port: 0,
    fetch(request, server) {
      if (
        new URL(request.url).pathname === "/message" &&
        server.upgrade(request, { data: { role: "lanes" } })
      ) {
        return;
      }
      return new Response("Not found", { status: 404 });
    },
    websocket: {
      message(socket, value) {
        const message = JSON.parse(String(value)) as {
          version: number;
          method: string;
          id?: string;
        };
        if (message.method === "getpeers") {
          socket.send(
            JSON.stringify({
              version: 2,
              id: message.id,
              result: nativeConnected ? { native: "role=ios" } : { tooling: null },
            }),
          );
        }
        if (message.method === "reload") reloads += 1;
      },
    },
  });
  const port = server.port;
  if (!port) throw new Error("Test server did not bind a TCP port");

  try {
    await expect(broadcastMetroReload(port)).resolves.toBe(1);
    expect(reloads).toBe(1);
    nativeConnected = false;
    await expect(broadcastMetroReload(port, 50)).rejects.toThrow("No native app is connected");
    expect(reloads).toBe(1);
  } finally {
    await server.stop(true);
  }
});
