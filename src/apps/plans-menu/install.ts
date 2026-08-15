import { chmod, copyFile, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

import { execa } from "execa";

const APP_NAME = "Plans.app";
const BUNDLE_ID = "com.muhammed.plans-menu";
const SOURCE_ROOT = import.meta.dir;

export async function installPlansMenu(): Promise<void> {
  const home = homedir();
  const appPath = join(home, "Applications", APP_NAME);
  const executablePath = join(appPath, "Contents", "MacOS", "PlansMenu");
  const launchAgentPath = join(home, "Library", "LaunchAgents", `${BUNDLE_ID}.plist`);

  await execa("swift", ["build", "-c", "release", "--package-path", SOURCE_ROOT], {
    stdio: "pipe",
  });
  const signingIdentity = await findAppleDevelopmentIdentity();

  const stagingRoot = await mkdtemp(join(tmpdir(), "plans-menu-"));
  const stagedApp = join(stagingRoot, APP_NAME);
  try {
    await mkdir(join(stagedApp, "Contents", "MacOS"), { recursive: true });
    await copyFile(
      join(SOURCE_ROOT, ".build", "release", "PlansMenu"),
      join(stagedApp, "Contents", "MacOS", "PlansMenu"),
    );
    await copyFile(join(SOURCE_ROOT, "Info.plist"), join(stagedApp, "Contents", "Info.plist"));
    await chmod(join(stagedApp, "Contents", "MacOS", "PlansMenu"), 0o755);
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

  const launchAgent = createLaunchAgent(executablePath, home);
  await mkdir(join(home, "Library", "LaunchAgents"), { recursive: true });
  await writeFile(launchAgentPath, launchAgent);

  const userID = process.getuid?.();
  if (userID === undefined) {
    throw new Error("The Plans menu-bar app can only be installed on macOS.");
  }
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
    throw new Error("A valid Apple Development signing identity is required to install Plans.");
  }
  return identity;
}

function createLaunchAgent(executablePath: string, home: string): string {
  const executableSearchPath = [
    join(home, ".local/share/mise/installs/node/latest/bin"),
    join(home, ".bun/bin"),
    join(home, ".local/bin"),
    join(home, "bin"),
    join(home, "Library/Application Support/Herd/bin"),
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ].join(":");
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
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>${escapeXml(home)}</string>
    <key>PATH</key>
    <string>${escapeXml(executableSearchPath)}</string>
  </dict>
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
