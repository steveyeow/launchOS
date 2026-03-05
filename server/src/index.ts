import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requireAuth } from "./routes/auth.js";
import authRoute from "./routes/auth.js";
import chatRoute from "./routes/chat.js";
import tasksRoute from "./routes/tasks.js";
import agentChatRoute from "./routes/agent-chat.js";
import { startWorker } from "./services/queue.js";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", cors({
  origin:       process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials:  true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge:       86400,
}));

// Public routes
app.get("/health", (c) => c.json({ ok: true }));
app.route("/api/v1/auth", authRoute);

// Protected routes — all require a valid Supabase JWT
const api = new Hono();
api.use("*", requireAuth);
api.route("/chat",    chatRoute);
api.route("/tasks",   tasksRoute);
api.route("/agents",  agentChatRoute);

app.route("/api/v1", api);

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
