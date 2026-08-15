export interface ProjectEnvironmentDefinition {
  id: string;
  name: string;
  rootEnvironmentVariable: string;
  backendDirectory: string;
  mobileDirectory: string;
  metroPortBase: number;
  vitePortBase?: number;
  defaultRoot: string;
  assetUrl?: (bucket: string) => string;
  phpVersion?: string;
}

export type ProjectDatabaseRole = "agent" | "mutation";

export interface ProjectEnvironmentContext {
  projectId: string;
  root: string;
  backendDir: string;
  mobileDir: string;
  lane: string;
  laneNumber: number;
  site: string;
  appUrl: string;
  database: string;
  testingDatabase: string;
  agentDatabase?: string;
  mutationDatabase?: string;
  prefix: string;
  sessionCookie: string;
  bucket: string;
  assetUrl?: string;
  metroPort: string;
  vitePort: string;
  simulatorName: string;
  herdBin: string;
  herdCertificateAuthority: string;
  herdCertificate: string;
  herdKey: string;
  herdCommand: string;
  phpCommand: string;
  phpArgsPrefix: string[];
  composerCommand: string;
  composerArgsPrefix: string[];
  mysqlCommand: string;
  phpVersion: string;
  registeredLaneRoots: string[];
  simulatorSlimming?: SimulatorSlimmingProfile;
}

export const PROJECT_ENVIRONMENT_OPERATIONS = [
  "setup",
  "mobile-development",
  "verify",
  "reset",
  "destroy",
] as const;

export type ProjectEnvironmentOperation = (typeof PROJECT_ENVIRONMENT_OPERATIONS)[number];

export type ProjectEnvironmentOperationHandler = (args: string[]) => Promise<void>;

export interface ProjectEnvironmentAdapter {
  databaseRoles: readonly ProjectDatabaseRole[];
  operations: Record<ProjectEnvironmentOperation, ProjectEnvironmentOperationHandler>;
}

export interface SimulatorSlimmingProfile {
  exceptCategories: string[];
  keepServices: string[];
}

export interface RunOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  allowFailure?: boolean;
}

export interface MarkedInstall {
  label: string;
  cwd: string;
  command: string;
  args: string[];
  hashRoot: string;
  hashFiles: string[];
  marker: string;
}
