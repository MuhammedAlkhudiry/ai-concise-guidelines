export type SystemToolLevel = "required" | "optional";

export interface SystemToolUpdatePlan {
  commands?: readonly string[];
  note?: string;
}

export type SystemToolLatestSource =
  | {
      type: "command";
      command: string;
      args: readonly string[];
    }
  | {
      type: "homebrew";
      formula: string;
    };

export interface SystemTool {
  name: string;
  level: SystemToolLevel;
  why: string;
  versionArgs?: readonly string[];
  latest?: SystemToolLatestSource;
  update: SystemToolUpdatePlan;
}

export interface SystemToolGroup {
  title: string;
  tools: readonly SystemTool[];
}

export const SYSTEM_TOOL_GROUPS = [
  {
    title: "Core repo tools",
    tools: [
      {
        name: "bun",
        level: "required",
        why: "Runtime used internally by mise run install.",
        versionArgs: ["--version"],
        latest: {
          type: "command",
          command: "npm",
          args: ["view", "bun", "version"],
        },
        update: {
          commands: ["bun upgrade"],
        },
      },
      {
        name: "git",
        level: "required",
        why: "Needed for remote skill checkout, hooks, and shared git helpers.",
        versionArgs: ["--version"],
        update: {
          note: "This machine uses Apple Git; update it through macOS/Xcode Command Line Tools, or intentionally switch to Homebrew Git.",
        },
      },
      {
        name: "mise",
        level: "required",
        why: "Needed for the supported local task workflow and global runtime management.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "mise",
        },
        update: {
          commands: ["brew upgrade mise"],
          note: "Use mise self-update only when mise was installed by the standalone installer.",
        },
      },
      {
        name: "node",
        level: "required",
        why: "Needed by the oxfmt CLI used in repo format checks.",
        versionArgs: ["--version"],
        latest: {
          type: "command",
          command: "mise",
          args: ["latest", "node"],
        },
        update: {
          commands: ["mise upgrade node --bump"],
          note: "Use this when node is managed by mise.",
        },
      },
      {
        name: "zsh",
        level: "required",
        why: "Needed by all installed shared shell commands.",
        versionArgs: ["--version"],
        update: {
          note: "Usually updated by macOS or the package manager that owns the shell.",
        },
      },
    ],
  },
  {
    title: "Shell and helper integrations",
    tools: [
      {
        name: "phpstorm",
        level: "optional",
        why: "Used by the synced zsh config as the editor command.",
        update: {
          note: "Update through JetBrains Toolbox or the PhpStorm app update flow.",
        },
      },
      {
        name: "ddev",
        level: "optional",
        why: "Used by Laravel aliases in the synced zsh config.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "ddev",
        },
        update: {
          commands: ["brew upgrade ddev"],
          note: "DDEV upgrades follow the install method; this is for the Homebrew install.",
        },
      },
      {
        name: "opencode",
        level: "optional",
        why: "Used by the ai/opencode launcher and OpenCode workflows.",
        versionArgs: ["--version"],
        latest: {
          type: "command",
          command: "npm",
          args: ["view", "opencode-ai", "version"],
        },
        update: {
          commands: ["opencode upgrade"],
        },
      },
      {
        name: "agent-browser",
        level: "required",
        why: "Default AI-agent browser automation CLI.",
        versionArgs: ["--version"],
        latest: {
          type: "command",
          command: "npm",
          args: ["view", "agent-browser", "version"],
        },
        update: {
          commands: ["agent-browser upgrade", "agent-browser install"],
          note: "Run agent-browser install after upgrades when Chrome for Testing needs repair.",
        },
      },
      {
        name: "agent-device",
        level: "required",
        why: "Default AI-agent mobile and device automation CLI.",
        versionArgs: ["--version"],
        latest: {
          type: "command",
          command: "npm",
          args: ["view", "agent-device", "version"],
        },
        update: {
          commands: ["npm install -g agent-device"],
        },
      },
      {
        name: "rtk",
        level: "optional",
        why: "Used to reduce noisy command output before it reaches AI agent context.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "rtk",
        },
        update: {
          commands: ["brew upgrade rtk"],
        },
      },
      {
        name: "solo",
        level: "required",
        why: "Controls Solo projects, processes, dev servers, logs, todos, and scratchpads.",
        versionArgs: ["--version"],
        update: {
          note: "App-owned CLI: update Solo.app, then run mise run install to refresh the managed symlink.",
        },
      },
      {
        name: "jq",
        level: "required",
        why: "Reads Solo's local HTTP API discovery file for raw API fallback workflows.",
        versionArgs: ["--version"],
        update: {
          note: "This machine uses Apple's jq; update it through macOS updates, or intentionally switch to Homebrew jq.",
        },
      },
      {
        name: "fzf",
        level: "optional",
        why: "Used by project pickers and interactive hosts/plan deletion.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "fzf",
        },
        update: {
          commands: ["brew upgrade fzf"],
        },
      },
      {
        name: "sg",
        level: "optional",
        why: "Optional AST-shaped code search through ast-grep when text search is too loose.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "ast-grep",
        },
        update: {
          commands: ["brew upgrade ast-grep"],
        },
      },
    ],
  },
  {
    title: "Git workflow helpers",
    tools: [
      {
        name: "gh",
        level: "optional",
        why: "Used to open GitHub pull requests from the command line.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "gh",
        },
        update: {
          commands: ["brew upgrade gh"],
        },
      },
      {
        name: "glab",
        level: "optional",
        why: "Used to open GitLab merge requests from the command line.",
        versionArgs: ["--version"],
        latest: {
          type: "homebrew",
          formula: "glab",
        },
        update: {
          commands: ["brew install glab"],
        },
      },
    ],
  },
] as const satisfies readonly SystemToolGroup[];

export function listSystemTools(): SystemTool[] {
  return SYSTEM_TOOL_GROUPS.flatMap((group) => [...group.tools]);
}
