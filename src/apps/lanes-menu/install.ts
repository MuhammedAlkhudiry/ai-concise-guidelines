import { chmod, copyFile, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

import { execa } from "execa";

const APP_NAME = "Lanes.app";
const BUNDLE_ID = "com.muhammed.lanes-menu";
const SOURCE_ROOT = import.meta.dir;

export async function installLanesMenu(): Promise<void> {
  const home = homedir();
  const appPath = join(home, "Applications", APP_NAME);
  const executablePath = join(appPath, "Contents", "MacOS", "LanesMenu");
  const launchAgentPath = join(home, "Library", "LaunchAgents", `${BUNDLE_ID}.plist`);

  await execa("swift", ["build", "-c", "release", "--package-path", SOURCE_ROOT], {
    stdio: "pipe",
  });

  const stagingRoot = await mkdtemp(join(tmpdir(), "lanes-menu-"));
  const stagedApp = join(stagingRoot, APP_NAME);
  try {
    await mkdir(join(stagedApp, "Contents", "MacOS"), { recursive: true });
    await copyFile(
      join(SOURCE_ROOT, ".build", "release", "LanesMenu"),
      join(stagedApp, "Contents", "MacOS", "LanesMenu"),
    );
    await copyFile(join(SOURCE_ROOT, "Info.plist"), join(stagedApp, "Contents", "Info.plist"));
    await chmod(join(stagedApp, "Contents", "MacOS", "LanesMenu"), 0o755);
    await execa("/usr/bin/codesign", ["--force", "--sign", "-", stagedApp], { stdio: "pipe" });

    await mkdir(join(home, "Applications"), { recursive: true });
    await rm(appPath, { recursive: true, force: true });
    await rename(stagedApp, appPath);
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }

  const launchAgent = createLaunchAgent(executablePath);
  await mkdir(join(home, "Library", "LaunchAgents"), { recursive: true });
  await writeFile(launchAgentPath, launchAgent);

  const userID = process.getuid?.();
  if (userID === undefined) {
    throw new Error("The Lanes menu-bar app can only be installed on macOS.");
  }
  const domain = `gui/${userID}`;
  await execa("/bin/launchctl", ["bootout", domain, launchAgentPath], {
    reject: false,
    stdio: "pipe",
  });
  await execa("/bin/launchctl", ["bootstrap", domain, launchAgentPath], { stdio: "pipe" });
}

function createLaunchAgent(executablePath: string): string {
  const escapedExecutablePath = escapeXml(executablePath);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${BUNDLE_ID}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapedExecutablePath}</string>
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
