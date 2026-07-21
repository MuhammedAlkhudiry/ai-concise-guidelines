import { join } from "node:path";

import type { ActiveProject } from "../src/lib/lanes-config";

const projectsRoot = "/Users/muhammed/PhpstormProjects";

export const ACTIVE_PROJECTS: ActiveProject[] = [
  {
    id: "awraq",
    name: "Awraq",
    remoteUrl: "https://github.com/MuhammedAlkhudiry/awraq-project.git",
    baseBranch: "main",
    lanes: [1, 2, 3].map((number) => ({
      number,
      path: join(projectsRoot, `awraq-lane-${number}`),
    })),
    environmentVariable: "AWRAQ_LANE_ROOT",
    simulatorSlimming: {
      exceptCategories: ["icloud", "store", "web", "pim", "photos"],
    },
  },
  {
    id: "harium",
    name: "Harium",
    remoteUrl: "https://github.com/MuhammedAlkhudiry/harium-project.git",
    baseBranch: "main",
    lanes: [1, 2, 3].map((number) => ({
      number,
      path: join(projectsRoot, `harium-lane-${number}`),
    })),
    environmentVariable: "HARIUM_LANE_ROOT",
    simulatorSlimming: {
      exceptCategories: ["icloud", "store"],
    },
  },
];
