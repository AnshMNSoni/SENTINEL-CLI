#!/usr/bin/env node
/**
 * verify-server.mjs — boots the Hono app, exercises the smoke-test flow,
 * and exits 0 on success.
 *
 * Steps:
 *   1. Boot the Hono app on a random port via @hono/node-server.
 *   2. GET /health and assert { ok: true }.
 *   3. POST /auth/dev-login and capture { token, userId }.
 *   4. GET /sessions with the bearer token; expect an array.
 *   5. POST /sessions then GET /sessions/:id roundtrip.
 *   6. DELETE /sessions/:id.
 *   7. Shut down and exit 0.
 *
 * This is the e2e gate run from `npm run test:e2e`.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const START_FILE = path.join(ROOT, "src", "server", "api", "start.js");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "sentinel-verify-"));
const PORT = Number(process.env.PORT || 4801 + Math.floor(Math.random() * 100));

function log(...args) {
  console.log("[verify]", ...args);
}

function fatal(msg, err) {
  console.error("[verify] FAIL:", msg);
  if (err) console.error(err);
  process.exit(1);
}

async function waitForReady(url, timeoutMs = 7000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

async function main() {
  log(`booting server on port ${PORT} (SENTINEL_HOME=${TMP})`);
  const env = {
    ...process.env,
    PORT: String(PORT),
    SENTINEL_HOME: TMP,
    NODE_ENV: "test",
  };
  delete env.DATABASE_URL;
  delete env.CLERK_SECRET_KEY;
  delete env.CLERK_PUBLISHABLE_KEY;
  delete env.POLAR_ACCESS_TOKEN;

  const child = spawn(process.execPath, [START_FILE], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const out = [];
  const err = [];
  child.stdout.on("data", (d) => out.push(d.toString()));
  child.stderr.on("data", (d) => err.push(d.toString()));

  const cleanup = () => {
    try {
      child.kill("SIGTERM");
    } catch {
      // ignore
    }
    try {
      fs.rmSync(TMP, { recursive: true, force: true });
    } catch {
      // ignore
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });

  const base = `http://localhost:${PORT}`;
  const ready = await waitForReady(`${base}/health`);
  if (!ready) {
    console.error("--- server stdout ---");
    console.error(out.join(""));
    console.error("--- server stderr ---");
    console.error(err.join(""));
    cleanup();
    fatal(`server did not become ready in time on ${base}`);
  }

  try {
    // 1. /health
    const healthRes = await fetch(`${base}/health`);
    const health = await healthRes.json();
    if (!health || health.ok !== true) {
      throw new Error(`/health returned ${JSON.stringify(health)}`);
    }
    log("OK /health");

    // 2. /auth/dev-login
    const loginRes = await fetch(`${base}/auth/dev-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "verify-user" }),
    });
    const login = await loginRes.json();
    if (!login.token || !login.userId) {
      throw new Error(`/auth/dev-login returned ${JSON.stringify(login)}`);
    }
    log(`OK /auth/dev-login (userId=${login.userId})`);

    const auth = { Authorization: `Bearer ${login.token}` };

    // 3. GET /sessions (empty)
    const listEmptyRes = await fetch(`${base}/sessions`, { headers: auth });
    if (listEmptyRes.status !== 200) {
      throw new Error(`GET /sessions returned ${listEmptyRes.status}`);
    }
    const listEmpty = await listEmptyRes.json();
    if (!Array.isArray(listEmpty)) {
      throw new Error(`GET /sessions did not return an array: ${JSON.stringify(listEmpty)}`);
    }
    log(`OK GET /sessions (count=${listEmpty.length})`);

    // 4. POST /sessions
    const createRes = await fetch(`${base}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ title: "verify session", mode: "PLAN" }),
    });
    if (createRes.status !== 201) {
      const txt = await createRes.text();
      throw new Error(`POST /sessions returned ${createRes.status}: ${txt}`);
    }
    const created = await createRes.json();
    if (!created.id) throw new Error(`POST /sessions missing id: ${JSON.stringify(created)}`);
    log(`OK POST /sessions (id=${created.id})`);

    // 5. GET /sessions/:id
    const getRes = await fetch(`${base}/sessions/${created.id}`, { headers: auth });
    if (getRes.status !== 200) throw new Error(`GET /sessions/:id returned ${getRes.status}`);
    const fetched = await getRes.json();
    if (fetched.id !== created.id) {
      throw new Error(`GET /sessions/:id mismatch: ${JSON.stringify(fetched)}`);
    }
    log(`OK GET /sessions/:id`);

    // 6. DELETE /sessions/:id
    const delRes = await fetch(`${base}/sessions/${created.id}`, {
      method: "DELETE",
      headers: auth,
    });
    if (delRes.status !== 200) throw new Error(`DELETE /sessions/:id returned ${delRes.status}`);
    log(`OK DELETE /sessions/:id`);

    log("ALL CHECKS PASSED");
    cleanup();
    process.exit(0);
  } catch (e) {
    console.error("--- server stdout ---");
    console.error(out.join(""));
    console.error("--- server stderr ---");
    console.error(err.join(""));
    cleanup();
    fatal(e.message || String(e), e);
  }
}

main().catch((e) => fatal("unhandled", e));
