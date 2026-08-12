import { z } from "zod";

import { output, run } from "./command";
import type { ProjectEnvironmentContext, SimulatorSlimmingProfile } from "./types";

export const SIMSLIM_MINIMUM_VERSION = "0.4.0";
export const SIMSLIM_INSTALL_COMMAND = "brew install mobai-app/tap/simslim";

const alwaysEnabledServiceSchema = z.object({
  label: z.string(),
  reason: z.string(),
});

const categorySchema = z.object({
  id: z.string(),
  labels: z.array(z.string()),
  alwaysEnabled: z.array(alwaysEnabledServiceSchema).optional(),
});

const statusSchema = z.object({
  managedDisabled: z.number(),
  managedTotal: z.number(),
  booted: z.boolean(),
  verdict: z.enum(["stock", "slim", "partially slim"]),
  dropped: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      downside: z.string(),
      labels: z.array(z.string()),
    }),
  ),
});

export type SimSlimCategory = z.infer<typeof categorySchema>;
export type SimSlimStatus = z.infer<typeof statusSchema>;

function versionParts(value: string): [number, number, number] {
  const match = value.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Could not read SimSlim version from: ${value.trim()}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function assertSupportedSimSlimVersion(value: string): void {
  const installed = versionParts(value);
  const minimum = versionParts(SIMSLIM_MINIMUM_VERSION);
  for (let index = 0; index < installed.length; index += 1) {
    if (installed[index] > minimum[index]) return;
    if (installed[index] < minimum[index]) {
      throw new Error(
        `SimSlim ${SIMSLIM_MINIMUM_VERSION}+ is required; found ${value.trim()}. Run: ${SIMSLIM_INSTALL_COMMAND}`,
      );
    }
  }
}

export function parseSimSlimCategories(value: string): SimSlimCategory[] {
  return z.array(categorySchema).parse(JSON.parse(value));
}

export function parseSimSlimStatus(value: string): SimSlimStatus {
  return statusSchema.parse(JSON.parse(value));
}

export function simSlimOnArgs(
  udid: string,
  profile: SimulatorSlimmingProfile,
  preserveBootState = false,
): string[] {
  const args = ["on", udid];
  if (profile.exceptCategories.length > 0) {
    args.push("--except", profile.exceptCategories.join(","));
  }
  if (profile.keepServices.length > 0) {
    args.push("--keep", profile.keepServices.join(","));
  }
  if (preserveBootState) args.push("--preserve-boot-state");
  return args;
}

export function simSlimOffArgs(udid: string, preserveBootState = false): string[] {
  return ["off", udid, ...(preserveBootState ? ["--preserve-boot-state"] : [])];
}

export function expectedDisabledLabels(
  categories: SimSlimCategory[],
  profile: SimulatorSlimmingProfile,
): string[] {
  const categoryIds = new Set(categories.map(({ id }) => id));
  const unknownCategories = profile.exceptCategories.filter((id) => !categoryIds.has(id));
  if (unknownCategories.length > 0) {
    throw new Error(`Unknown SimSlim categories: ${unknownCategories.join(", ")}`);
  }

  const allLabels = new Set(categories.flatMap(({ labels }) => labels));
  const unknownServices = profile.keepServices.filter((label) => !allLabels.has(label));
  if (unknownServices.length > 0) {
    throw new Error(`Unknown SimSlim services: ${unknownServices.join(", ")}`);
  }

  const preservedCategories = new Set(profile.exceptCategories);
  const preservedServices = new Set([
    ...profile.keepServices,
    ...alwaysEnabledLabels(categories),
    ...categories
      .filter(({ id }) => preservedCategories.has(id))
      .flatMap(({ labels }) => labels),
  ]);
  return categories
    .filter(({ id }) => !preservedCategories.has(id))
    .flatMap(({ labels }) => labels)
    .filter((label) => !preservedServices.has(label))
    .sort();
}

export function disabledLabels(status: SimSlimStatus): string[] {
  return [...new Set(status.dropped.flatMap(({ labels }) => labels))].sort();
}

export function alwaysEnabledLabels(categories: SimSlimCategory[]): string[] {
  return [
    ...new Set(
      categories.flatMap(({ alwaysEnabled = [] }) => alwaysEnabled.map(({ label }) => label)),
    ),
  ].sort();
}

export function parseDisabledLaunchdLabels(value: string): string[] {
  return value
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = /^\s*"([^"]+)"\s*=>\s*(?:disabled|true)\s*$/.exec(line);
      return match ? [match[1]] : [];
    })
    .sort();
}

export function assertAlwaysEnabledServices(
  categories: SimSlimCategory[],
  disabled: string[],
): void {
  const required = new Set(alwaysEnabledLabels(categories));
  const unexpectedlyDisabled = disabled.filter((label) => required.has(label));
  if (unexpectedlyDisabled.length > 0) {
    throw new Error(`Required SimSlim services disabled: ${unexpectedlyDisabled.join(", ")}`);
  }
}

export function assertSimSlimProfile(
  categories: SimSlimCategory[],
  status: SimSlimStatus,
  profile: SimulatorSlimmingProfile,
): void {
  const expected = expectedDisabledLabels(categories, profile);
  const actual = disabledLabels(status);
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((label) => !actualSet.has(label));
  const unexpected = actual.filter((label) => !expectedSet.has(label));
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      [
        `SimSlim profile mismatch (${actual.length}/${expected.length} expected services disabled)`,
        missing.length > 0 ? `missing: ${missing.join(", ")}` : undefined,
        unexpected.length > 0 ? `unexpected: ${unexpected.join(", ")}` : undefined,
      ]
        .filter(Boolean)
        .join("; "),
    );
  }
}

function simSlimOutput(
  context: ProjectEnvironmentContext,
  args: string[],
  step = "simslim",
): string {
  try {
    return output(context, step, "simslim", args, { cwd: context.root });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ENOENT")) {
      throw new Error(`SimSlim is unavailable. Run: ${SIMSLIM_INSTALL_COMMAND}`);
    }
    throw new Error(`SimSlim failed: ${message}`);
  }
}

function ensureSimSlim(context: ProjectEnvironmentContext): SimSlimCategory[] {
  assertSupportedSimSlimVersion(simSlimOutput(context, ["--version"]));
  return parseSimSlimCategories(simSlimOutput(context, ["profiles", "--json"]));
}

export function applySimulatorSlimming(context: ProjectEnvironmentContext, udid: string): void {
  const profile = context.simulatorSlimming;
  if (!profile) return;
  expectedDisabledLabels(ensureSimSlim(context), profile);
  run(context, "simslim", "simslim", simSlimOnArgs(udid, profile), { cwd: context.root });
}

export function verifySimulatorSlimming(context: ProjectEnvironmentContext, udid: string): void {
  const profile = context.simulatorSlimming;
  if (!profile) return;
  const categories = ensureSimSlim(context);
  const status = parseSimSlimStatus(
    simSlimOutput(context, ["status", udid, "--dropped", "--json"]),
  );
  assertSimSlimProfile(categories, status, profile);
  const disabled = parseDisabledLaunchdLabels(
    output(
      context,
      "simslim:required-services",
      "xcrun",
      ["simctl", "spawn", udid, "launchctl", "print-disabled", "system"],
      { cwd: context.root },
    ),
  );
  assertAlwaysEnabledServices(categories, disabled);
}
