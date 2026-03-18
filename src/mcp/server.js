import { runMCPServer } from '../commands/mcpCommand.js';

/**
 * Sentinel MCP Server entrypoint.
 * Exposes Sentinel's security and quality analyzers as MCP tools.
 */
export async function startServer() {
  await runMCPServer();
}

export default { startServer };
