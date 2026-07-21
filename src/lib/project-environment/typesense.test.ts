import { describe, expect, test } from "bun:test";

import { deleteTypesenseCollections, verifyTypesense } from "./typesense";

const connection = { url: "http://127.0.0.1:8108/", apiKey: "secret" };

describe("Typesense environment helpers", () => {
  test("verifies the configured health endpoint with its API key", async () => {
    const requests: Array<{ input: string; init?: RequestInit }> = [];

    await verifyTypesense(connection, {
      request: async (input, init) => {
        requests.push({ input, init });
        return new Response(null, { status: 200 });
      },
    });

    expect(requests).toEqual([
      {
        input: "http://127.0.0.1:8108/health",
        init: { headers: { "X-TYPESENSE-API-KEY": "secret" } },
      },
    ]);
  });

  test("deletes only collections owned by the requested prefix", async () => {
    const requests: string[] = [];

    const deleted = await deleteTypesenseCollections(connection, "awraq_lane_3_", {
      request: async (input, init) => {
        requests.push(`${init?.method ?? "GET"} ${input}`);
        if (!init?.method) {
          return Response.json([{ name: "awraq_lane_3_nodes" }, { name: "awraq_lane_1_nodes" }]);
        }
        return new Response(null, { status: 200 });
      },
    });

    expect(deleted).toEqual(["awraq_lane_3_nodes"]);
    expect(requests).toEqual([
      "GET http://127.0.0.1:8108/collections",
      "DELETE http://127.0.0.1:8108/collections/awraq_lane_3_nodes",
    ]);
  });
});
