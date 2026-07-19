import { log, output, run } from "./command";
import type { ProjectEnvironmentContext } from "./types";

interface SimulatorDevice {
  name: string;
  udid?: string;
  state?: string;
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
  return Object.values(simulatorList(context).devices)
    .flat()
    .find((device) => device.name === context.simulatorName);
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
  run(context, "simulator", "open", ["-a", "Simulator"], { cwd: context.root });
}

export function verifySimulator(context: ProjectEnvironmentContext): void {
  if (simulatorDevice(context)?.state !== "Booted") {
    throw new Error(`${context.simulatorName} is not booted`);
  }
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
