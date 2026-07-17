import { join } from "node:path";

export interface ActiveProject {
  id: string;
  name: string;
  repository: string;
  baseBranch: string;
  laneRoot: string;
  laneCount: number;
  environmentVariable: string;
}

const projectsRoot = "/Users/muhammed/PhpstormProjects";
const lanesRoot = join(projectsRoot, "project-lanes");

export const ACTIVE_PROJECTS: ActiveProject[] = [
  {
    id: "awraq",
    name: "Awraq",
    repository: join(projectsRoot, "awraq-project"),
    baseBranch: "main",
    laneRoot: join(lanesRoot, "awraq"),
    laneCount: 3,
    environmentVariable: "AWRAQ_LANE_ROOT",
  },
  {
    id: "harium",
    name: "Harium",
    repository: join(projectsRoot, "harium-project"),
    baseBranch: "main",
    laneRoot: join(lanesRoot, "harium"),
    laneCount: 3,
    environmentVariable: "HARIUM_LANE_ROOT",
  },
];
