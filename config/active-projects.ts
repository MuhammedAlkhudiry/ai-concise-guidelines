import { join } from "node:path";

import type { ActiveProject } from "../src/lib/lanes-config";

const projectsRoot = "/Users/muhammed/PhpstormProjects";

export const ACTIVE_PROJECTS: ActiveProject[] = [
  {
    id: "awraq",
    name: "Awraq",
    remoteUrl: "https://github.com/MuhammedAlkhudiry/awraq-project.git",
    baseBranch: "main",
    lanePathPattern: join(projectsRoot, "awraq-lane-{number}"),
    lanes: [1, 2, 3, 4, 5, 6].map((number) => ({
      number,
      path: join(projectsRoot, `awraq-lane-${number}`),
    })),
    environmentVariable: "AWRAQ_LANE_ROOT",
    pullRequest: {
      model: "gpt-5.6-terra",
    },
    services: [
      {
        id: "frontend",
        name: "Frontend",
        directory: "family-tree",
        runner: { type: "bun-script", script: "dev" },
      },
      {
        id: "metro",
        name: "Metro",
        directory: "awraq-mobile-app",
        runner: { type: "bun-script", script: "start" },
      },
      {
        id: "horizon",
        name: "Horizon",
        directory: "family-tree",
        runner: { type: "artisan", command: "horizon" },
      },
    ],
    simulatorSlimming: {
      exceptCategories: ["icloud", "store", "web", "pim", "photos", "connectivity"],
    },
  },
  {
    id: "harium",
    name: "Harium",
    remoteUrl: "https://github.com/MuhammedAlkhudiry/harium-project.git",
    baseBranch: "main",
    lanePathPattern: join(projectsRoot, "harium-lane-{number}"),
    lanes: [1, 2, 3].map((number) => ({
      number,
      path: join(projectsRoot, `harium-lane-${number}`),
    })),
    environmentVariable: "HARIUM_LANE_ROOT",
    pullRequest: {
      model: "gpt-5.6-terra",
    },
    services: [
      {
        id: "frontend",
        name: "Frontend",
        directory: "harium",
        runner: { type: "bun-script", script: "dev" },
      },
      {
        id: "metro",
        name: "Metro",
        directory: "harium-app",
        runner: { type: "bun-script", script: "start" },
      },
      {
        id: "horizon",
        name: "Horizon",
        directory: "harium",
        runner: { type: "artisan", command: "horizon" },
      },
    ],
    simulatorSlimming: {
      exceptCategories: ["icloud", "store", "connectivity"],
    },
  },
];
