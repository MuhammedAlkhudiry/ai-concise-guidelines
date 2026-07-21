import { expect, test } from "bun:test";

import { developmentClientUrl } from "./expo";
import { findSimulator } from "./simulator";

test("selects the configured simulator regardless of list order", () => {
  const simulator = findSimulator(
    {
      devices: {
        runtime: [
          { name: "Project Lane 1", state: "Booted", udid: "lane-1" },
          { name: "Project Lane 3", state: "Shutdown", udid: "lane-3" },
        ],
      },
    },
    "Project Lane 3",
  );

  expect(simulator?.udid).toBe("lane-3");
});

test("builds a development-client URL from the project scheme and lane port", () => {
  expect(developmentClientUrl("exp+project", "8203")).toBe(
    "exp+project://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8203",
  );
});
