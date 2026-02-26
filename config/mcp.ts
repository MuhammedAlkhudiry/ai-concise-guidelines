/**
 * MCP server definitions shared across supported environments.
 * Single source of truth for MCP entries used during config generation.
 */

export interface LocalMcpServer {
  type: "local";
  command: [string, ...string[]];
}

export interface RemoteMcpServer {
  type: "remote";
  url: string;
}

export type McpServer = LocalMcpServer | RemoteMcpServer;

export const MCP_SERVERS: Record<string, McpServer> = {
  hugeicons: {
    type: "local",
    command: ["npx", "-y", "@hugeicons/mcp-server"],
  },
  solo: {
    type: "remote",
    url: "http://localhost:45678/",
  },
};
