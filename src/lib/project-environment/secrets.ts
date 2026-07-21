import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

import { log, output } from "./command";
import type { ProjectEnvironmentContext } from "./types";

export function loadShellSecret(context: ProjectEnvironmentContext, key: string): void {
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) throw new Error(`Invalid environment key: ${key}`);
  const secretsFile = resolve(homedir(), ".config/my-setup/secrets.zsh");
  if (process.env[key] || !existsSync(secretsFile)) return;

  const value = output(
    context,
    "secrets",
    "zsh",
    ["-c", `source "$1"\nprint -rn -- "\${${key}-}"`, "project-lane-secret", secretsFile],
    { cwd: context.root, allowFailure: true },
  ).trim();
  if (!value) return;

  process.env[key] = value;
  log("secrets", `loaded ${key} from ~/.config/my-setup/secrets.zsh`);
}
