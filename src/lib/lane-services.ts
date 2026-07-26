import { execFileSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readlinkSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

import { execa } from "execa";

import { findSimulator } from "./project-environment/simulator";
import {
  getActiveProject,
  getActiveProjects,
  getProjectLanes,
  selectProjectLane,
  type Lane,
} from "./project-lanes";
import type { LaneServiceDefinition } from "./lanes-config";

export type LaneServiceState =
  "running" | "starting" | "stopped" | "failed" | "unavailable";

export interface LaneServiceStatus {
  id: string;
  name: string;
  state: LaneServiceState;
  manageable: boolean;
  managed: boolean;
  command?: string;
  directory?: string;
  logPath?: string;
  pid?: number;
  detail?: string;
}

export interface LaneServicesStatus {
  project: string;
  lane: string;
  path: string;
  services: LaneServiceStatus[];
}

interface ServiceContext {
  lane: Lane;
  definition: LaneServiceDefinition;
  directory: string;
  executable: string;
  args: string[];
  command: string;
  label: string;
  plistPath: string;
  logPath: string;
}

interface ObservedProcess {
  pid: number;
  parentPid: number;
  command: string;
  directory: string;
}

const userId = process.getuid?.();
if (userId === undefined) throw new Error("lanes services requires macOS");

const launchDomain = `gui/${userId}`;
const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local/state");
const serviceStateDirectory = join(stateHome, "lanes/services");
const launchAgentsDirectory = join(homedir(), "Library/LaunchAgents");

export async function listLaneServiceStatuses(
  projectId?: string,
  laneId?: string,
): Promise<LaneServicesStatus[]> {
  const lanes = selectedLanes(projectId, laneId);
  const observed = processSnapshot();
  return Promise.all(
    lanes.map(async (lane) => ({
      project: lane.project.id,
      lane: lane.id,
      path: lane.path,
      services: [
        await siteStatus(lane),
        ...lane.project.services.map((service) =>
          serviceStatus(serviceContext(lane, service), observed),
        ),
      ],
    })),
  );
}

export function verifyLaneServiceDefinitions(
  projectId?: string,
  laneId?: string,
): void {
  for (const lane of selectedLanes(projectId, laneId)) {
    for (const definition of lane.project.services) {
      const context = serviceContext(lane, definition);
      if (!serviceAvailable(context)) {
        throw new Error(
          `${lane.project.id}/${lane.id}/${definition.id} is unavailable: ${context.command} in ${context.directory}`,
        );
      }
    }
  }
}

export async function startLaneService(
  projectId: string,
  laneId: string,
  serviceId: string,
): Promise<LaneServicesStatus> {
  const lane = explicitLane(projectId, laneId);
  for (const definition of selectedServices(lane, serviceId)) {
    await startService(serviceContext(lane, definition));
  }
  return laneServicesStatus(lane);
}

export async function stopLaneService(
  projectId: string,
  laneId: string,
  serviceId: string,
): Promise<LaneServicesStatus> {
  const lane = explicitLane(projectId, laneId);
  for (const definition of selectedServices(lane, serviceId)) {
    await stopService(serviceContext(lane, definition));
  }
  return laneServicesStatus(lane);
}

export async function restartLaneService(
  projectId: string,
  laneId: string,
  serviceId: string,
): Promise<LaneServicesStatus> {
  const lane = explicitLane(projectId, laneId);
  for (const definition of selectedServices(lane, serviceId)) {
    const context = serviceContext(lane, definition);
    await stopService(context);
    await startService(context);
  }
  return laneServicesStatus(lane);
}

export function laneServiceLogPath(
  projectId: string,
  laneId: string,
  serviceId: string,
): string {
  const lane = explicitLane(projectId, laneId);
  const definition = selectedServices(lane, serviceId)[0];
  if (!definition || serviceId === "all")
    throw new Error("Logs require one service id");
  return serviceContext(lane, definition).logPath;
}

export function readLaneServiceLogs(
  projectId: string,
  laneId: string,
  serviceId: string,
  lines = 30,
): string {
  const path = laneServiceLogPath(projectId, laneId, serviceId);
  if (!existsSync(path)) return "No captured output yet.";
  const size = statSync(path).size;
  const length = Math.min(size, 256 * 1024);
  const descriptor = openSync(path, "r");
  const buffer = Buffer.alloc(length);
  try {
    readSync(descriptor, buffer, 0, length, size - length);
  } finally {
    closeSync(descriptor);
  }
  const ansiSequence = new RegExp(
    `${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`,
    "g",
  );
  const value = buffer
    .toString("utf8")
    .replace(ansiSequence, "")
    .replaceAll("\r", "");
  return (
    value.split("\n").slice(-Math.max(1, lines)).join("\n").trim() ||
    "No output captured yet."
  );
}

export async function openLaneTarget(
  projectId: string,
  laneId: string,
  target: "phpstorm" | "simulator" | "browser",
): Promise<void> {
  const lane = explicitLane(projectId, laneId);
  if (target === "phpstorm") {
    await execa("open", ["-a", "PhpStorm", lane.path]);
    return;
  }
  if (target === "browser") {
    await execa("open", [`https://${lane.project.id}-${lane.id}.test`]);
    return;
  }

  const simulatorName = `${lane.project.name} Lane ${lane.number}`;
  const document = JSON.parse(
    execFileSync("xcrun", ["simctl", "list", "-j", "devices"], {
      encoding: "utf8",
    }),
  ) as {
    devices: Record<
      string,
      Array<{
        name: string;
        udid?: string;
        state?: string;
        isAvailable?: boolean;
      }>
    >;
  };
  const simulator = findSimulator(document, simulatorName);
  if (!simulator?.udid)
    throw new Error(`Simulator ${simulatorName} is missing`);
  if (simulator.state !== "Booted") {
    await execa("xcrun", ["simctl", "boot", simulator.udid]);
  }
  await execa("open", ["-a", "Simulator"]);
}

async function laneServicesStatus(lane: Lane): Promise<LaneServicesStatus> {
  const statuses = await listLaneServiceStatuses(lane.project.id, lane.id);
  const status = statuses[0];
  if (!status)
    throw new Error(
      `Could not read services for ${lane.project.id}/${lane.id}`,
    );
  return status;
}

function selectedLanes(projectId?: string, laneId?: string): Lane[] {
  if (laneId && !projectId) throw new Error("A lane id requires a project id");
  if (projectId && laneId) return [explicitLane(projectId, laneId)];
  const projects = projectId
    ? [getActiveProject(projectId)]
    : getActiveProjects();
  return projects.flatMap(getProjectLanes);
}

function explicitLane(projectId: string, laneId: string): Lane {
  return selectProjectLane(getActiveProjects(), { projectId, laneId });
}

function selectedServices(
  lane: Lane,
  serviceId: string,
): LaneServiceDefinition[] {
  if (serviceId === "all") return lane.project.services;
  const service = lane.project.services.find(({ id }) => id === serviceId);
  if (!service)
    throw new Error(
      `Unknown service: ${lane.project.id}/${lane.id}/${serviceId}`,
    );
  return [service];
}

function serviceContext(
  lane: Lane,
  definition: LaneServiceDefinition,
): ServiceContext {
  const directory = resolve(lane.path, definition.directory);
  const environment = laneServiceEnvironment(directory);
  const scriptArguments = environment.EXPO_DEV_SERVER_PORT
    ? ["--port", environment.EXPO_DEV_SERVER_PORT]
    : [];
  const safeKey = `${lane.project.id}.${lane.id}.${definition.id}`.replace(
    /[^a-zA-Z0-9.-]/g,
    "-",
  );
  const label = `com.muhammed.lanes.${safeKey}`;
  const executable = (() => {
    if (definition.runner.type === "bun-script") {
      return findExecutable([
          join(homedir(), ".bun/bin/bun"),
          "/opt/homebrew/bin/bun",
          "/usr/local/bin/bun",
      ]);
    }
    if (definition.runner.type === "npm-script") {
      return findExecutable([
        join(homedir(), ".local/share/mise/installs/node/latest/bin/npm"),
        "/opt/homebrew/bin/npm",
        "/usr/local/bin/npm",
      ]);
    }
    return findExecutable([
      join(homedir(), "Library/Application Support/Herd/bin/php"),
      "/opt/homebrew/bin/php",
      "/usr/local/bin/php",
      "/usr/bin/php",
    ]);
  })();
  const args = (() => {
    if (definition.runner.type === "bun-script") {
      return [definition.runner.script, ...scriptArguments];
    }
    if (definition.runner.type === "npm-script") {
      return ["run", definition.runner.script, ...(scriptArguments.length ? ["--", ...scriptArguments] : [])];
    }
    return ["artisan", definition.runner.command];
  })();
  const command = (() => {
    if (definition.runner.type === "artisan") return `php artisan ${definition.runner.command}`;
    const runtime = definition.runner.type === "npm-script" ? "npm run" : "bun";
    return `${runtime} ${[definition.runner.script, ...scriptArguments].join(" ")}`;
  })();
  return {
    lane,
    definition,
    directory,
    executable,
    args,
    command,
    label,
    plistPath: join(launchAgentsDirectory, `${label}.plist`),
    logPath: join(serviceStateDirectory, `${safeKey}.log`),
  };
}

function findExecutable(candidates: string[]): string {
  const executable = candidates.find((path) => existsSync(path));
  if (!executable) {
    throw new Error(
      `Missing executable: ${candidates.map((path) => basename(path)).join(" or ")}`,
    );
  }
  return executable;
}

function serviceAvailable(context: ServiceContext): boolean {
  if (!existsSync(context.directory)) return false;
  if (context.definition.runner.type === "artisan") {
    return existsSync(join(context.directory, "artisan"));
  }
  const packagePath = join(context.directory, "package.json");
  if (!existsSync(packagePath)) return false;
  try {
    const packageDocument = JSON.parse(readFileSync(packagePath, "utf8")) as {
      scripts?: Record<string, string>;
    };
    return Boolean(packageDocument.scripts?.[context.definition.runner.script]);
  } catch {
    return false;
  }
}

function serviceStatus(
  context: ServiceContext,
  observed = processSnapshot(),
): LaneServiceStatus {
  const base = {
    id: context.definition.id,
    name: context.definition.name,
    manageable: true,
    command: context.command,
    directory: context.directory,
    logPath: context.logPath,
  };
  if (!serviceAvailable(context)) {
    return { ...base, state: "unavailable", managed: false };
  }

  const launchStatus = launchAgentStatus(context.label);
  if (launchStatus.loaded) {
    return {
      ...base,
      state: launchStatus.pid
        ? "running"
        : launchStatus.failed
          ? "failed"
          : "starting",
      managed: true,
      ...(launchStatus.pid ? { pid: launchStatus.pid } : {}),
    };
  }
  const external = matchingProcesses(context, observed)[0];
  return external
    ? { ...base, state: "running", managed: false, pid: external.pid }
    : { ...base, state: "stopped", managed: false };
}

async function siteStatus(lane: Lane): Promise<LaneServiceStatus> {
  try {
    const certificateAuthority = join(
      homedir(),
      "Library/Application Support/Herd/config/valet/CA/LaravelValetCASelfSigned.pem",
    );
    const response = await fetch(`https://${lane.project.id}-${lane.id}.test`, {
      method: "HEAD",
      signal: AbortSignal.timeout(3_000),
      ...(existsSync(certificateAuthority)
        ? { tls: { ca: readFileSync(certificateAuthority, "utf8") } }
        : {}),
    });
    return {
      id: "site",
      name: "Site",
      state:
        response.ok || (response.status >= 300 && response.status < 400)
          ? "running"
          : "failed",
      manageable: false,
      managed: false,
      ...(response.ok || (response.status >= 300 && response.status < 400)
        ? {}
        : { detail: `HTTP ${response.status} ${response.statusText}`.trim() }),
    };
  } catch (error) {
    return {
      id: "site",
      name: "Site",
      state: "failed",
      manageable: false,
      managed: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function startService(context: ServiceContext): Promise<void> {
  if (!serviceAvailable(context)) {
    throw new Error(
      `${context.definition.name} is unavailable in ${context.lane.project.id}/${context.lane.id}`,
    );
  }
  const current = serviceStatus(context);
  if (current.state === "running") return;

  mkdirSync(dirname(context.logPath), { recursive: true });
  mkdirSync(dirname(context.plistPath), { recursive: true });
  closeSync(openSync(context.logPath, "a"));
  writeFileSync(context.plistPath, launchAgentPlist(context), { mode: 0o600 });
  chmodSync(context.plistPath, 0o600);
  await execa("launchctl", ["bootstrap", launchDomain, context.plistPath]);
  await Bun.sleep(300);
  const status = serviceStatus(context);
  if (status.state === "failed" || status.state === "stopped") {
    await execa("launchctl", ["bootout", launchDomain, context.plistPath], {
      reject: false,
    });
    rmSync(context.plistPath, { force: true });
    throw new Error(
      `${context.definition.name} failed to start; see ${context.logPath}`,
    );
  }
}

async function stopService(context: ServiceContext): Promise<void> {
  if (existsSync(context.plistPath)) {
    await execa("launchctl", ["bootout", launchDomain, context.plistPath], {
      reject: false,
    });
    rmSync(context.plistPath, { force: true });
  }
  const processes = matchingProcesses(context, processSnapshot());
  const ids = new Set(processes.map(({ pid }) => pid));
  const roots = processes.filter(({ parentPid }) => !ids.has(parentPid));
  for (const item of roots) terminateProcessTree(item.pid, "SIGTERM");
  if (roots.length > 0) await Bun.sleep(600);
  for (const item of roots) {
    try {
      process.kill(item.pid, 0);
      terminateProcessTree(item.pid, "SIGKILL");
    } catch {
      // The process exited after SIGTERM.
    }
  }
}

function launchAgentStatus(label: string): {
  loaded: boolean;
  pid?: number;
  failed: boolean;
} {
  try {
    const output = execFileSync(
      "launchctl",
      ["print", `${launchDomain}/${label}`],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    const pid = output.match(/\bpid = (\d+)/)?.[1];
    const exitCode = output.match(/last exit code = (-?\d+)/)?.[1];
    return {
      loaded: true,
      ...(pid ? { pid: Number(pid) } : {}),
      failed: exitCode !== undefined && Number(exitCode) !== 0,
    };
  } catch {
    return { loaded: false, failed: false };
  }
}

function processSnapshot(): ObservedProcess[] {
  let output = "";
  try {
    output = execFileSync("ps", ["-axo", "pid=,ppid=,command="], {
      encoding: "utf8",
    });
  } catch {
    return [];
  }
  return output
    .split("\n")
    .map((line) => line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .filter((match) =>
      /\b(?:bun|npm)\b.*\b(dev|start(?::lane)?)\b|artisan\s+horizon/.test(
        match[3]!.toLowerCase(),
      ),
    )
    .flatMap((match) => {
      const pid = Number(match[1]);
      const directory = processDirectory(pid);
      return directory
        ? [
            {
              pid,
              parentPid: Number(match[2]),
              command: match[3]!.toLowerCase(),
              directory,
            },
          ]
        : [];
    });
}

function processDirectory(pid: number): string | undefined {
  try {
    const output = execFileSync(
      "lsof",
      ["-a", "-p", String(pid), "-d", "cwd", "-Fn"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    return output
      .split("\n")
      .find((line) => line.startsWith("n"))
      ?.slice(1);
  } catch {
    return undefined;
  }
}

function matchingProcesses(
  context: ServiceContext,
  observed: ObservedProcess[],
): ObservedProcess[] {
  const expectedDirectory = canonicalPath(context.directory);
  return observed.filter((process) => {
    if (canonicalPath(process.directory) !== expectedDirectory) return false;
    if (context.definition.runner.type === "artisan") {
      return process.command.includes(
        `artisan ${context.definition.runner.command}`,
      );
    }
    const script = context.definition.runner.script.toLowerCase();
    const runtime = context.definition.runner.type === "npm-script" ? "npm" : "bun";
    return (
      process.command.includes(`${runtime} ${script}`) ||
      process.command.includes(`${runtime} run ${script}`)
    );
  });
}

function canonicalPath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    try {
      return resolve(dirname(path), readlinkSync(path));
    } catch {
      return resolve(path);
    }
  }
}

function terminateProcessTree(pid: number, signal: NodeJS.Signals): void {
  for (const child of childPids(pid)) terminateProcessTree(child, signal);
  try {
    process.kill(pid, signal);
  } catch {
    // The process already exited.
  }
}

function childPids(pid: number): number[] {
  try {
    return execFileSync("pgrep", ["-P", String(pid)], { encoding: "utf8" })
      .split(/\s+/)
      .filter(Boolean)
      .map(Number);
  } catch {
    return [];
  }
}

function launchAgentPlist(context: ServiceContext): string {
  const path = [
    join(homedir(), ".local/share/mise/installs/node/latest/bin"),
    join(homedir(), ".bun/bin"),
    join(homedir(), ".local/bin"),
    join(homedir(), "Library/Application Support/Herd/bin"),
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ].join(":");
  const environment = {
    HOME: homedir(),
    PATH: path,
    USER: process.env.USER ?? "muhammed",
    ...laneServiceEnvironment(context.directory),
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${xml(context.label)}</string>
  <key>ProgramArguments</key>
  <array>${[context.executable, ...context.args].map((value) => `\n    <string>${xml(value)}</string>`).join("")}
  </array>
  <key>WorkingDirectory</key><string>${xml(context.directory)}</string>
  <key>EnvironmentVariables</key>
  <dict>${Object.entries(environment)
    .map(
      ([key, value]) =>
        `\n    <key>${xml(key)}</key><string>${xml(value)}</string>`,
    )
    .join("")}
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>2</integer>
  <key>StandardOutPath</key><string>${xml(context.logPath)}</string>
  <key>StandardErrorPath</key><string>${xml(context.logPath)}</string>
</dict>
</plist>
`;
}

function laneServiceEnvironment(directory: string): Record<string, string> {
  const path = join(directory, ".env.local");
  if (!existsSync(path)) return {};
  const match = readFileSync(path, "utf8").match(
    /^EXPO_DEV_SERVER_PORT\s*=\s*["']?([^\s"']+)["']?\s*$/m,
  );
  return match?.[1] ? { EXPO_DEV_SERVER_PORT: match[1] } : {};
}

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
