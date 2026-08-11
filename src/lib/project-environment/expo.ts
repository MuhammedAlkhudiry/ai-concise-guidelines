import { execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { findSimulator } from "./simulator";

export interface ExpoDevelopmentClientOptions {
  cwd: string;
  port: string;
  scheme: string;
  simulatorName: string;
}

export interface ExpoDevelopmentClientEnvironmentOptions {
  cwd: string;
  scheme: string;
  simulatorNameVariable: string;
  portVariable?: string;
}

export function developmentClientUrl(scheme: string, port: string): string {
  const metroUrl = encodeURIComponent(`http://127.0.0.1:${port}`);
  return `${scheme}://expo-development-client/?url=${metroUrl}`;
}

async function waitForMetro(port: string): Promise<void> {
  const statusUrl = `http://127.0.0.1:${port}/status`;
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(statusUrl);
      if ((await response.text()) === "packager-status:running") return;
    } catch {
      // Metro is still starting.
    }
    await Bun.sleep(250);
  }

  throw new Error(`Metro did not become ready on port ${port}`);
}

function openDevelopmentClient(options: ExpoDevelopmentClientOptions): void {
  const state = JSON.parse(
    execFileSync("xcrun", ["simctl", "list", "-j", "devices"], { encoding: "utf8" }),
  ) as Parameters<typeof findSimulator>[0];
  const simulator = findSimulator(state, options.simulatorName);
  if (!simulator?.udid) throw new Error(`iOS simulator ${options.simulatorName} is missing`);

  if (simulator.state !== "Booted") {
    execFileSync("xcrun", ["simctl", "boot", simulator.udid], { stdio: "pipe" });
  }
  execFileSync("open", ["-a", "Simulator"], { stdio: "ignore" });
  execFileSync(
    "xcrun",
    ["simctl", "openurl", simulator.udid, developmentClientUrl(options.scheme, options.port)],
    { stdio: "pipe" },
  );
  console.log(`Opened Metro ${options.port} on ${options.simulatorName}`);
}

export async function startExpoDevelopmentClient(
  options: ExpoDevelopmentClientOptions,
): Promise<void> {
  const expo = spawn("bunx", ["expo", "start", "--port", options.port], {
    cwd: options.cwd,
    env: process.env,
    stdio: "inherit",
  });
  const completion = new Promise<number>((resolve, reject) => {
    expo.once("error", reject);
    expo.once("exit", (code) => resolve(code ?? 1));
  });
  const stopExpo = (signal: NodeJS.Signals) => expo.kill(signal);
  process.once("SIGINT", () => stopExpo("SIGINT"));
  process.once("SIGTERM", () => stopExpo("SIGTERM"));

  try {
    await Promise.race([
      waitForMetro(options.port),
      completion.then((code) => {
        throw new Error(`Expo exited before Metro became ready (code ${code})`);
      }),
    ]);
    try {
      openDevelopmentClient(options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Metro is running, but the assigned simulator could not be opened: ${message}`);
    }
    process.exitCode = await completion;
  } catch (error) {
    if (expo.exitCode === null) expo.kill("SIGTERM");
    throw error;
  }
}

export async function startExpoDevelopmentClientFromEnvironment(
  options: ExpoDevelopmentClientEnvironmentOptions,
): Promise<void> {
  const portVariable = options.portVariable ?? "EXPO_DEV_SERVER_PORT";
  const port = process.env[portVariable];
  const simulatorName = process.env[options.simulatorNameVariable];
  if (!port || !simulatorName) {
    throw new Error(`${portVariable} and ${options.simulatorNameVariable} are required`);
  }
  await startExpoDevelopmentClient({
    cwd: options.cwd,
    port,
    simulatorName,
    scheme: options.scheme,
  });
}

export function verifyExpoDevelopmentClientFreshness(options: {
  mobileDirectory: string;
  simulatorName: string;
  bundleIdentifier: string;
}): void {
  const state = JSON.parse(
    execFileSync("xcrun", ["simctl", "list", "-j", "devices"], { encoding: "utf8" }),
  ) as Parameters<typeof findSimulator>[0];
  const simulator = findSimulator(state, options.simulatorName);
  if (!simulator?.udid) throw new Error(`iOS simulator ${options.simulatorName} is missing`);

  let applicationPath: string;
  try {
    applicationPath = execFileSync(
      "xcrun",
      ["simctl", "get_app_container", simulator.udid, options.bundleIdentifier, "app"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    throw new Error(
      `Development client ${options.bundleIdentifier} is not installed on ${options.simulatorName}`,
    );
  }

  const installedAt = statSync(applicationPath).mtimeMs;
  const inputs = [
    "package.json",
    "bun.lock",
    "bun.lockb",
    "app.json",
    "app.config.js",
    "app.config.ts",
    "ios/Podfile",
    "ios/Podfile.lock",
  ];
  const iosDirectory = join(options.mobileDirectory, "ios");
  if (existsSync(iosDirectory)) {
    const visit = (directory: string): void => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (
          entry.isDirectory() &&
          !["Pods", "build", "DerivedData"].includes(entry.name) &&
          !entry.name.endsWith(".xcworkspace")
        ) {
          visit(path);
        } else if (entry.isFile() && entry.name === "project.pbxproj") {
          inputs.push(path.slice(options.mobileDirectory.length + 1));
        }
      }
    };
    visit(iosDirectory);
  }
  const staleInput = inputs
    .map((path) => ({ path, absolute: join(options.mobileDirectory, path) }))
    .filter(({ absolute }) => existsSync(absolute))
    .find(({ absolute }) => statSync(absolute).mtimeMs > installedAt);
  if (staleInput) {
    throw new Error(
      `Development client is older than ${staleInput.path}; rebuild and reinstall it on ${options.simulatorName}`,
    );
  }
}
