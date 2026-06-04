/**
 * TUI API client — TypeScript-friendly wrapper around the Node HTTP client
 * in `src/server/api/client.js`. Used by the chat hook and the session
 * screen to talk to the Sentinel Hono server.
 *
 * Mirrors the auto-generated `apiClient` from `hono/client` in
 * `packages/cli/src/lib/api-client.ts` (Nightcode).
 */

import { streamSse, Sessions as ServerSessions, Auth as ServerAuth } from "../../server/api/client.js";

export type ChatEvent =
  | { event: "text"; data: { delta: string } }
  | { event: "tool_call"; data: { toolName: string; toolCallId: string; input: unknown } }
  | { event: "tool_result"; data: { toolCallId: string; output: unknown } }
  | { event: "reasoning"; data: { text: string } }
  | { event: "finish"; data: { usage?: { inputTokens: number; outputTokens: number } } }
  | { event: "error"; data: { message: string } }
  | { event: "done"; data: Record<string, unknown> };

export const Sessions = {
  async list() {
    try {
      const res = await ServerSessions.list();
      if (!res.ok) return [];
      return (await res.json()) as Array<{
        id: string;
        title: string;
        createdAt: string;
        mode: string;
        model: string;
      }>;
    } catch { return []; }
  },
  async get(id: string) {
    try {
      const res = await ServerSessions.get(id);
      if (!res.ok) return null;
      return (await res.json()) as {
        id: string;
        userId: string;
        title: string;
        mode: string;
        model: string;
        messages: Array<{
          id: string;
          role: string;
          content?: string;
          parts?: Array<Record<string, unknown>>;
          metadata?: Record<string, unknown>;
        }>;
      };
    } catch { return null; }
  },
  async create(body: { title: string; mode?: string; model?: string; projectPath?: string }) {
    try {
      const res = await ServerSessions.create(body);
      if (!res.ok) return null;
      return (await res.json()) as { id: string; title: string };
    } catch { return null; }
  },
  async delete(id: string) {
    try {
      const res = await ServerSessions.delete(id);
      return res.ok;
    } catch { return false; }
  },
};

export const Auth = {
  async devLogin(userId?: string) {
    const res = await ServerAuth.devLogin(userId);
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return (await res.json()) as { token: string; userId: string };
  },
  async devLogout(token: string) {
    const res = await ServerAuth.devLogout(token);
    return res.ok;
  },
  async ensure() {
    const { getAuth } = await import("../../server/api/client.js");
    const auth = getAuth();
    if (auth) return auth;
    const { token, userId } = await Auth.devLogin();
    const { saveAuth } = await import("../../server/api/client.js");
    saveAuth({ token, userId });
    return { token, userId };
  },
};

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${process.env.PORT || 3000}/health`, {
      signal: AbortSignal.timeout(2000)
    });
    return res.ok;
  } catch { return false; }
}

/**
 * Stream a chat request. Yields decoded SSE events.
 */
export async function* streamChat(body: {
  id: string;
  messages: Array<{ id: string; role: string; content?: string; parts?: unknown[]; metadata?: Record<string, unknown> }>;
  mode: string;
  model: string;
}): AsyncGenerator<ChatEvent> {
  const iter = await streamSse("/chat", body);
  for await (const ev of iter) {
    yield ev as ChatEvent;
  }
}
