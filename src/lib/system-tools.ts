export type SystemToolLevel = "required" | "optional";

export interface SystemToolUpdatePlan {
  commands?: readonly string[];
  note?: string;
}

export interface SystemTool {
  name: string;
  level: SystemToolLevel;
  why: string;
  versionArgs?: readonly string[];
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
        update: {
          commands: ["opencode upgrade"],
        },
      },
      {
        name: "agent-browser",
        level: "required",
        why: "Default AI-agent browser automation CLI.",
        versionArgs: ["--version"],
        update: {
          commands: ["agent-browser upgrade", "agent-browser install"],
          note: "Run agent-browser install after upgrades when Chrome for Testing needs repair.",
        },
      },
      {
        name: "rtk",
        level: "optional",
        why: "Used to reduce noisy command output before it reaches AI agent context.",
        versionArgs: ["--version"],
        update: {
          note: "Manual/local tool: update from the same source used to install it.",
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
        update: {
          commands: ["brew upgrade fzf"],
        },
      },
      {
        name: "sg",
        level: "optional",
        why: "Optional AST-shaped code search through ast-grep when text search is too loose.",
        versionArgs: ["--version"],
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
        update: {
          commands: ["brew upgrade gh"],
        },
      },
      {
        name: "glab",
        level: "optional",
        why: "Used to open GitLab merge requests from the command line.",
        versionArgs: ["--version"],
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
