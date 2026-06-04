/**
 * Hono server entry point.
 *
 * Mirrors packages/server/src/index.ts from Nightcode. Routes are
 * mounted under `/auth`, `/billing`, `/sessions`, `/chat`. The default
 * auth middleware (when Clerk is configured) is applied to protected
 * paths.
 *
 * This file is consumed by:
 *   - `src/server/api/start.js` to run as a standalone process
 *   - The CLI's hono client to type the API surface
 */

import { Hono } from "hono";
import authRoutes from "./routes/auth.js";
import billingRoutes from "./routes/billing.js";
import sessionRoutes from "./routes/sessions.js";
import chatRoutes from "./routes/chat.js";
import { requireAuth } from "./middleware/auth.js";

const app = new Hono();

app.onError((err, c) => {
  console.error("[server] unhandled error:", err);
  if (err instanceof Error && err.name === "HTTPException") {
    return c.json({ error: err.message }, err.status || 500);
  }
  return c.json({ error: "Internal server error" }, 500);
});

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));
app.get("/", (c) =>
  c.json({
    name: "sentinel-api",
    version: "2.0.2",
    docs: "https://github.com/KunjShah95/SENTINEL-CLI",
  })
);

app.route("/auth", authRoutes);

// Protected paths
app.use("/sessions/*", requireAuth());
app.use("/chat/*", requireAuth());
app.use("/billing/checkout", requireAuth());
app.use("/billing/portal", requireAuth());

app.route("/billing", billingRoutes);
app.route("/sessions", sessionRoutes);
app.route("/chat", chatRoutes);

export { app };
export default app;
