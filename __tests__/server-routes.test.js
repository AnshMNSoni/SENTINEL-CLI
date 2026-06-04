/**
 * Tests for the Hono API in src/server/api/app.js.
 *
 * Uses `app.fetch(new Request(...))` for in-process dispatch — no real port.
 * Isolates auth + DB to a temp SENTINEL_HOME so the user's real
 * ~/.sentinel directory is never touched.
 *
 * Run with:  node --test __tests__/server-routes.test.js
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// IMPORTANT: env vars must be set before importing the app, because both
// `src/server/api/middleware/auth.js` and `src/server/database/adapter.js`
// snapshot `SENTINEL_HOME` at module-load time.
const sentinelHome = await mkdtemp(join(tmpdir(), "sentinel-api-"));
process.env.SENTINEL_HOME = sentinelHome;
process.env.SENTINEL_DB_BACKEND = "json";

const { app } = await import("../src/server/api/app.js");
const { setDatabase, JsonAdapter } = await import("../src/server/database/adapter.js");
const { issueDevToken } = await import("../src/server/api/middleware/auth.js");

// Pin a fresh, isolated JSON DB so tests don't read/write the user's
// real session file.
setDatabase(new JsonAdapter(join(sentinelHome, "db", "sentinel.json")));

let token;
let userId;

before(async () => {
  // Pre-issue a token so we don't have to round-trip through /auth/dev-login
  // for every test that needs auth.
  userId = "test-user";
  token = issueDevToken(userId);
  assert.ok(typeof token === "string" && token.length > 0, "token should be a non-empty string");
});

after(async () => {
  if (sentinelHome) await rm(sentinelHome, { recursive: true, force: true });
});

function makeRequest(path, init = {}) {
  const url = `http://test.local${path}`;
  return new Request(url, init);
}

test("GET /health returns 200 with ok payload", async () => {
  const res = await app.fetch(makeRequest("/health"));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(typeof body.ts, "number");
});

test("GET / returns server info", async () => {
  const res = await app.fetch(makeRequest("/"));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, "sentinel-api");
  assert.equal(typeof body.version, "string");
});

test("POST /sessions without auth returns 401", async () => {
  const res = await app.fetch(
    makeRequest("/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "should not be created" }),
    })
  );
  assert.equal(res.status, 401);
});

test("POST /auth/dev-login returns a token", async () => {
  const res = await app.fetch(
    makeRequest("/auth/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "login-test-user" }),
    })
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(typeof body.token, "string");
  assert.ok(body.token.length > 0);
  assert.equal(body.userId, "login-test-user");
});

test("POST /sessions with a token returns 201 and a session record", async () => {
  const res = await app.fetch(
    makeRequest("/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: "first session" }),
    })
  );
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.title, "first session");
  assert.equal(body.userId, userId);
  assert.equal(body.mode, "BUILD"); // default
  assert.equal(typeof body.id, "string");
  assert.ok(Array.isArray(body.messages));
});

test("GET /sessions with a token returns an array", async () => {
  const res = await app.fetch(
    makeRequest("/sessions", {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
  assert.equal(res.status, 200);
  const list = await res.json();
  assert.ok(Array.isArray(list));
  // We created one session above; expect at least one entry for our user.
  const ours = list.filter((s) => s.userId === userId);
  assert.ok(ours.length >= 1, "expected at least one session for the test user");
});

test("POST /chat (PLAN mode, no tool calls) returns 200 with SSE", async () => {
  // Create a fresh session to chat against.
  const createRes = await app.fetch(
    makeRequest("/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: "chat target", mode: "PLAN" }),
    })
  );
  assert.equal(createRes.status, 201);
  const session = await createRes.json();

  const res = await app.fetch(
    makeRequest("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: session.id,
        mode: "PLAN",
        model: "claude-sonnet-4-6",
        messages: [
          {
            id: "m1",
            role: "user",
            content: "hello",
            parts: [{ type: "text", text: "hello" }],
          },
        ],
      }),
    })
  );
  assert.equal(res.status, 200);
  assert.match(
    res.headers.get("content-type") || "",
    /^text\/event-stream/,
    "chat response should be an SSE stream"
  );
  // Drain the stream a little — the local orchestrator yields at least
  // one text frame and a done frame.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (let i = 0; i < 5; i++) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    if (buffer.includes("\n\n") && buffer.includes("event: done")) break;
  }
  try {
    reader.releaseLock();
  } catch {
    // ignore
  }
  assert.ok(buffer.length > 0, "SSE stream should yield at least one frame");
  assert.ok(
    /event: (text|done)/.test(buffer),
    `expected a text or done SSE event, got: ${buffer.slice(0, 200)}`
  );
});
