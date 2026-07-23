export interface ProjectEnvironmentDefinition {
  id: string;
  name: string;
  rootEnvironmentVariable: string;
  backendDirectory: string;
  mobileDirectory: string;
  metroPortBase: number;
  defaultRoot: string;
  assetUrl?: (bucket: string) => string;
  phpVersion?: string;
}

export interface ProjectEnvironmentContext {
  root: string;
  backendDir: string;
  mobileDir: string;
  lane: string;
  laneNumber: number;
  site: string;
  appUrl: string;
  database: string;
  prefix: string;
  sessionCookie: string;
  bucket: string;
  assetUrl?: string;
  metroPort: string;
  simulatorName: string;
  herdBin: string;
  herdCertificateAuthority: string;
  herdCommand: string;
  phpCommand: string;
  phpArgsPrefix: string[];
  composerCommand: string;
  composerArgsPrefix: string[];
  mysqlCommand: string;
  phpVersion: string;
  simulatorSlimming?: SimulatorSlimmingProfile;
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
