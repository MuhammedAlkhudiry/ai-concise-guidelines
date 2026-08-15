import { chmod, copyFile, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

import { execa } from "execa";

const APP_NAME = "Ads.app";
const BUNDLE_ID = "com.muhammed.ads-menu";
const SOURCE_ROOT = import.meta.dir;

export async function installAdsMenu(): Promise<void> {
  const home = homedir();
  const appPath = join(home, "Applications", APP_NAME);
  const executablePath = join(appPath, "Contents", "MacOS", "AdsMenu");
  const launchAgentPath = join(home, "Library", "LaunchAgents", `${BUNDLE_ID}.plist`);
  const cachePath = join(process.env.XDG_CACHE_HOME || join(home, ".cache"), "my-setup", "ads");

  await execa("swift", ["build", "-c", "release", "--package-path", SOURCE_ROOT], {
    stdio: "pipe",
  });
  const signingIdentity = await findAppleDevelopmentIdentity();
  const stagingRoot = await mkdtemp(join(tmpdir(), "ads-menu-"));
  const stagedApp = join(stagingRoot, APP_NAME);
  try {
    await mkdir(join(stagedApp, "Contents", "MacOS"), { recursive: true });
    await copyFile(
      join(SOURCE_ROOT, ".build", "release", "AdsMenu"),
      join(stagedApp, "Contents", "MacOS", "AdsMenu"),
    );
    await copyFile(join(SOURCE_ROOT, "Info.plist"), join(stagedApp, "Contents", "Info.plist"));
    await chmod(join(stagedApp, "Contents", "MacOS", "AdsMenu"), 0o755);
    await execa(
      "/usr/bin/codesign",
      ["--force", "--sign", signingIdentity, "--timestamp=none", stagedApp],
      { stdio: "pipe" },
    );
    await mkdir(join(home, "Applications"), { recursive: true });
    await rm(appPath, { recursive: true, force: true });
    await rename(stagedApp, appPath);
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }

  await mkdir(join(home, "Library", "LaunchAgents"), { recursive: true });
  await writeFile(launchAgentPath, createLaunchAgent(executablePath));
  await rm(cachePath, { recursive: true, force: true });
  const userID = process.getuid?.();
  if (userID === undefined) throw new Error("The Ads menu-bar app can only be installed on macOS.");
  const domain = `gui/${userID}`;
  await execa("/bin/launchctl", ["bootout", domain, launchAgentPath], {
    reject: false,
    stdio: "pipe",
  });
  await execa("/bin/launchctl", ["bootstrap", domain, launchAgentPath], { stdio: "pipe" });
}

async function findAppleDevelopmentIdentity(): Promise<string> {
  const { stdout } = await execa(
    "/usr/bin/security",
    ["find-identity", "-v", "-p", "codesigning"],
    { stdio: "pipe" },
  );
  const identity = stdout.match(/^\s*\d+\)\s+([A-F0-9]{40})\s+"Apple Development:/m)?.[1];
  if (!identity) {
    throw new Error("A valid Apple Development signing identity is required to install Ads.");
  }
  return identity;
}

function createLaunchAgent(executablePath: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${BUNDLE_ID}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapeXml(executablePath)}</string>
  </array>
  <key>ProcessType</key>
  <string>Interactive</string>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
