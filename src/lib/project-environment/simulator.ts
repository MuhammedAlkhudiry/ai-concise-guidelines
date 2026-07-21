import { existsSync } from "node:fs";

import { log, output, run } from "./command";
import { applySimulatorSlimming, verifySimulatorSlimming } from "./simslim";
import type { ProjectEnvironmentContext } from "./types";

export interface SimulatorDevice {
  name: string;
  udid?: string;
  state?: string;
  isAvailable?: boolean;
}

interface SimulatorRuntime {
  identifier: string;
  platform?: string;
  isAvailable?: boolean;
  version?: string;
}

interface SimulatorDeviceType {
  identifier: string;
  name: string;
}

interface SimulatorList {
  devicetypes: SimulatorDeviceType[];
  runtimes: SimulatorRuntime[];
  devices: Record<string, SimulatorDevice[]>;
}

export function findSimulator(
  state: Pick<SimulatorList, "devices">,
  name: string,
): SimulatorDevice | undefined {
  const matches = Object.values(state.devices)
    .flat()
    .filter((device) => device.name === name && device.isAvailable !== false);
  if (matches.length > 1) {
    throw new Error(`Multiple available iOS simulators are named ${name}`);
  }
  return matches[0];
}

function simulatorList(context: ProjectEnvironmentContext): SimulatorList {
  return JSON.parse(
    output(
      context,
      "simulator",
      "xcrun",
      ["simctl", "list", "-j", "devicetypes", "runtimes", "devices"],
      { cwd: context.root },
    ),
  ) as SimulatorList;
}

function simulatorDevice(context: ProjectEnvironmentContext): SimulatorDevice | undefined {
  return findSimulator(simulatorList(context), context.simulatorName);
}

export function setupSimulator(context: ProjectEnvironmentContext): void {
  if (!simulatorDevice(context)) {
    const state = simulatorList(context);
    const runtime = state.runtimes
      .filter((item) => item.platform === "iOS" && item.isAvailable !== false)
      .sort((left, right) =>
        (right.version ?? "").localeCompare(left.version ?? "", undefined, { numeric: true }),
      )[0];
    const deviceType =
      ["iPhone 16 Pro", "iPhone 15 Pro", "iPhone 14 Pro", "iPhone 13 Pro"]
        .map((name) => state.devicetypes.find((item) => item.name === name))
        .find(Boolean) ?? state.devicetypes.find((item) => item.name.includes("iPhone"));
    if (!runtime || !deviceType) {
      throw new Error("No available iOS simulator runtime or device type");
    }
    run(
      context,
      "simulator",
      "xcrun",
      ["simctl", "create", context.simulatorName, deviceType.identifier, runtime.identifier],
      { cwd: context.root },
    );
  } else {
    log("simulator", `${context.simulatorName} already exists`);
  }
  const udid = simulatorDevice(context)?.udid;
  if (!udid) throw new Error(`Simulator ${context.simulatorName} is missing`);
  run(context, "simulator", "xcrun", ["simctl", "boot", udid], {
    cwd: context.root,
    allowFailure: true,
  });
  if (!existsSync(context.herdCertificateAuthority)) {
    throw new Error(`Herd certificate authority is missing at ${context.herdCertificateAuthority}`);
  }
  run(
    context,
    "simulator",
    "xcrun",
    ["simctl", "keychain", udid, "add-root-cert", context.herdCertificateAuthority],
    { cwd: context.root },
  );
  applySimulatorSlimming(context, udid);
  run(context, "simulator", "open", ["-a", "Simulator"], { cwd: context.root });
}

export function verifySimulator(context: ProjectEnvironmentContext): void {
  const simulator = simulatorDevice(context);
  if (simulator?.state !== "Booted" || !simulator.udid) {
    throw new Error(`${context.simulatorName} is not booted`);
  }
  verifySimulatorSlimming(context, simulator.udid);
}

export function cleanSimulator(context: ProjectEnvironmentContext): void {
  const udid = simulatorDevice(context)?.udid;
  if (!udid) return;
  run(context, "clean:simulator", "xcrun", ["simctl", "shutdown", udid], {
    cwd: context.root,
    allowFailure: true,
  });
  run(context, "clean:simulator", "xcrun", ["simctl", "delete", udid], {
    cwd: context.root,
  });
}
