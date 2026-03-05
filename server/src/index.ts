import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { requireAuth } from "./routes/auth.js";
import authRoute from "./routes/auth.js";
import chatRoute from "./routes/chat.js";
import tasksRoute from "./routes/tasks.js";
import agentChatRoute from "./routes/agent-chat.js";
import { startWorker } from "./services/queue.js";
import type { Context, Next } from "hono";

const app = new Hono();

// Global middleware
app.use("*", logger());

// Manual CORS middleware — handles preflight before any routing/auth
app.use("*", async (c: Context, next: Next) => {
  const origin = process.env.FRONTEND_URL ?? "http://localhost:5173";

  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");

  if (c.req.method === "OPTIONS") {
    c.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    c.header("Access-Control-Max-Age", "86400");
    return c.body(null, 204);
  }

  await next();
});

// Public routes
app.get("/health", (c) => c.json({ ok: true }));
app.route("/api/v1/auth", authRoute);

// Auth guard for protected route groups
app.use("/api/v1/chat/*", requireAuth);
app.use("/api/v1/tasks/*", requireAuth);
app.use("/api/v1/agents/*", requireAuth);

// Protected routes — mounted directly so CORS middleware always applies
app.route("/api/v1/chat",    chatRoute);
app.route("/api/v1/tasks",   tasksRoute);
app.route("/api/v1/agents",  agentChatRoute);

// Start BullMQ worker for background agent tasks
const worker = startWorker();

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
