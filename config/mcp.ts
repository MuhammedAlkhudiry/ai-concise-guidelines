/**
 * MCP server definitions shared across supported environments.
 * Single source of truth for MCP entries used during config generation.
 */

export interface LocalMcpServer {
  type: "local";
  command: [string, ...string[]];
}

export type McpServer = LocalMcpServer;

export const MCP_SERVERS: Record<string, McpServer> = {
  hugeicons: {
    type: "local",
    command: ["npx", "-y", "@hugeicons/mcp-server"],
  },
  playwriter: {
    type: "local",
    command: ["npx", "-y", "playwriter@latest"],
  },
};
