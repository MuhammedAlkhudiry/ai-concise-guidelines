import { MODELS } from "./models";
import { createOpencodeMcpConfig, createOpencodeMcpToolConfig } from "./mcp";

export interface OpencodeConfig {
  $schema: string;
  instructions: string[];
  plugin: string[];
  mcp: ReturnType<typeof createOpencodeMcpConfig>;
  tools: Record<string, boolean>;
  keybinds: Record<string, string>;
  model: string;
  small_model: string;
  permission: {
    external_directory: Record<string, string>;
    read: Record<string, string>;
    bash: Record<string, string>;
  };
  agent: {
    plan: {
      disable: boolean;
    };
    explore: {
      model: string;
    };
    general: {
      model: string;
    };
  };
}

export function createOpencodeConfig(homeDir: string): OpencodeConfig {
  return {
    $schema: "https://opencode.ai/config.json",
    instructions: [],
    plugin: [],
    mcp: createOpencodeMcpConfig(),
    tools: createOpencodeMcpToolConfig(),
    keybinds: {
      model_cycle_favorite: "ctrl+a",
      model_cycle_favorite_reverse: "ctrl+shift+a",
    },
    model: MODELS.smart,
    small_model: MODELS.fast,
    permission: {
      external_directory: {
        "*": "ask",
        [`${homeDir}/PhpstormProjects/*`]: "allow",
        "/tmp/*": "allow",
        "/private/tmp/*": "allow",
        "~/.config/*": "allow",
        "~/.agents/*": "allow",
      },
      read: {
        "**/.env*": "allow",
      },
      bash: {
        "herd *": "allow",
        "git *": "allow",
        "grep *": "allow",
        "rg *": "allow",
        "find *": "allow",
        "ls *": "allow",
        "cat *": "allow",
        "head *": "allow",
        "tail *": "allow",
        "wc *": "allow",
      },
    },
    agent: {
      plan: {
        disable: true,
      },
      explore: {
        model: MODELS.fast,
      },
      general: {
        model: MODELS.smart,
      },
    },
  };
}
