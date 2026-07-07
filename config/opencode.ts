import { MCP_SERVERS } from "./mcp";
import { MODELS } from "./models";

export interface OpencodeConfig {
  $schema: string;
  instructions: string[];
  plugin: string[];
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
  mcp: typeof MCP_SERVERS;
}

export function createOpencodeConfig(homeDir: string): OpencodeConfig {
  return {
    $schema: "https://opencode.ai/config.json",
    instructions: [],
    plugin: [],
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
    mcp: MCP_SERVERS,
  };
}
