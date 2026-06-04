/**
 * Standalone server bootstrap.
 *
 * Runs the Hono app on Node via @hono/node-server (preferred) or on
 * Bun if available. Listens on PORT (default 3000) and applies a long
 * idleTimeout so LLM tool-call streams don't get killed mid-flight.
 *
 * Mirrors packages/server/src/index.ts from Nightcode.
 */

import { app } from "./app.js";

const PORT = Number(process.env.PORT || 3000);

async function main() {
  // Bun path
  if (typeof Bun !== "undefined") {
    console.log(`[sentinel-api] listening on http://localhost:${PORT} (bun)`);
    Bun.serve({
      port: PORT,
      fetch: app.fetch,
      idleTimeout: 255,
    });
    return;
  }

  // Node path — load @hono/node-server lazily so the file can be imported
  // by other modules (e.g. tests) without the package being installed.
  let serve;
  try {
    ({ serve } = await import("@hono/node-server"));
  } catch (e) {
    console.error(
      "[sentinel-api] No runtime detected. Install Bun (https://bun.sh) or run `npm i @hono/node-server`."
    );
    process.exit(1);
  }
  console.log(`[sentinel-api] listening on http://localhost:${PORT} (node)`);
  serve({
    port: PORT,
    fetch: app.fetch,
    idleTimeout: 255_000,
  });
}

main().catch((e) => {
  console.error("[sentinel-api] fatal:", e);
  process.exit(1);
});
