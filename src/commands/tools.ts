import { execa } from "execa";

import { SYSTEM_TOOL_GROUPS, type SystemTool } from "../lib/system-tools";

interface ToolStatus {
  tool: SystemTool;
  path?: string;
  version?: string;
  versionError?: string;
}

async function commandOutput(command: string, args: string[]): Promise<string | undefined> {
  try {
    const result = await execa(command, args, {
      env: process.env,
      timeout: 5_000,
    });
    return result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
  } catch {
    return undefined;
  }
}

async function commandPath(command: string): Promise<string | undefined> {
  return commandOutput("zsh", ["-lc", `command -v ${command}`]);
}

async function toolStatus(tool: SystemTool): Promise<ToolStatus> {
  const path = await commandPath(tool.name);
  if (!path) {
    return { tool };
  }

  if (!tool.versionArgs) {
    return { tool, path };
  }

  const version = await commandOutput(tool.name, [...tool.versionArgs]);
  if (version) {
    return { tool, path, version };
  }

  return { tool, path, versionError: "version unavailable" };
}

async function groupStatuses(tools: readonly SystemTool[]): Promise<ToolStatus[]> {
  return Promise.all(tools.map((tool) => toolStatus(tool)));
}

function statusLabel(status: ToolStatus): string {
  if (status.path) {
    return "ok";
  }
  return status.tool.level;
}

function versionText(status: ToolStatus): string {
  if (status.version) {
    return status.version;
  }
  if (status.versionError) {
    return status.versionError;
  }
  if (status.path) {
    return "installed";
  }
  return "missing";
}

export async function toolsStatus(): Promise<void> {
  for (const group of SYSTEM_TOOL_GROUPS) {
    console.log(`\n## ${group.title}`);
    const statuses = await groupStatuses(group.tools);

    for (const status of statuses) {
      const location = status.path ? ` ${status.path}` : "";
      console.log(
        `[${statusLabel(status)}] ${status.tool.name.padEnd(13)} ${versionText(status)}${location}`,
      );
    }
  }
}

export async function toolsUpdatePlan(): Promise<void> {
  console.log("Tool update plan");
  console.log("Review these commands before running them. They are grouped by install owner.");

  for (const group of SYSTEM_TOOL_GROUPS) {
    console.log(`\n## ${group.title}`);
    const statuses = await groupStatuses(group.tools);

    for (const status of statuses) {
      console.log(`\n${status.tool.name}`);
      console.log(`  status: ${versionText(status)}`);
      if (status.path) {
        console.log(`  path: ${status.path}`);
      }

      if (status.tool.update.commands) {
        console.log("  update:");
        for (const command of status.tool.update.commands) {
          console.log(`    ${command}`);
        }
      }

      if (status.tool.update.note) {
        console.log(`  note: ${status.tool.update.note}`);
      }
    }
  }
}
