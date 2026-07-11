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
  jetbrains: {
    type: "remote",
    url: "http://127.0.0.1:64342/stream",
  },
  sentry: {
    type: "remote",
    url: "https://mcp.sentry.dev/mcp?utm_source=plugin",
  },
};
