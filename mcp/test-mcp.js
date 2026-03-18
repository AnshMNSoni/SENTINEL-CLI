#!/usr/bin/env node
/**
 * Quick smoke-test for the Sentinel MCP server.
 * Sends a few JSON-RPC messages over stdio and checks the responses.
 *
 * Run with: node test-mcp.js
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "sentinel-mcp-server.js");

const server = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
const results = [];

server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep incomplete line
  for (const line of lines) {
    if (line.trim()) {
      try {
        results.push(JSON.parse(line));
      } catch {
        // not JSON, ignore
      }
    }
  }
});

server.stderr.on("data", (d) => process.stderr.write(d));

function send(msg) {
  server.stdin.write(JSON.stringify(msg) + "\n");
}

// 1. Initialize
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" },
  },
});

// 2. List tools
setTimeout(() => {
  send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
}, 200);

// 3. Call sentinel_review_code on a snippet with an obvious SQL injection
setTimeout(() => {
  send({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "sentinel_review_code",
      arguments: {
        code: `
async function getUser(id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  return db.execute(query);
}
const password = "admin123";
        `.trim(),
        language: "javascript",
      },
    },
  });
}, 400);

// 4. Print results and exit
setTimeout(() => {
  console.log("\n=== MCP Server Test Results ===\n");
  for (const r of results) {
    if (r.id === 1) {
      console.log("✓ Initialize:", r.result?.serverInfo?.name, r.result?.serverInfo?.version);
    }
    if (r.id === 2) {
      const tools = r.result?.tools ?? [];
      console.log(`✓ Tools listed: ${tools.length} tools`);
      tools.forEach((t) => console.log(`  - ${t.name}`));
    }
    if (r.id === 3) {
      console.log("\n✓ Code review response:");
      const text = r.result?.content?.[0]?.text ?? JSON.stringify(r.result);
      console.log(text.split("\n").map((l) => "  " + l).join("\n"));
    }
  }
  server.kill();
  process.exit(0);
}, 3000);
