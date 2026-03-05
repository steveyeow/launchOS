import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { streamAriaResponse } from "../agents/aria.js";
import { db, conversations, messages } from "../db/index.js";
import { eq, and, asc, or } from "drizzle-orm";
import type { ApiResponse } from "../../../shared/types.js";
import type { AppEnv } from "../lib/hono.js";

const chat = new Hono<AppEnv>();

// POST /api/v1/chat
// Streams ARIA's response via SSE.
// Body: { message: string, conversationId?: string }
chat.post("/", async (c) => {
  const userId = c.get("userId") as string;
  const { message, conversationId: existingId } = await c.req.json<{
    message: string;
    conversationId?: string;
  }>();

  if (!message?.trim()) {
    return c.json<ApiResponse<null>>({ data: null, error: "message is required" }, 400);
  }

  // Resolve or create conversation
  let conversationId = existingId;
  if (!conversationId) {
    const [conv] = await db.insert(conversations).values({
      userId,
      agentName: "ARIA",
    }).returning();
    conversationId = conv.id;
  } else {
    const conv = await db.query.conversations.findFirst({
      where: and(eq(conversations.id, conversationId), eq(conversations.userId, userId)),
    });
    if (!conv) {
      return c.json<ApiResponse<null>>({ data: null, error: "conversation not found" }, 404);
    }
  }

  const stream = await streamAriaResponse(userId, conversationId, message);

  return streamSSE(c, async (sse) => {
    // Send conversation id first so client can track it
    await sse.writeSSE({ event: "conversationId", data: conversationId! });

    // Use fullStream to capture both text deltas and tool results
    for await (const chunk of stream.fullStream) {
      if (chunk.type === "text-delta") {
        await sse.writeSSE({ event: "text", data: chunk.textDelta });
      } else if (chunk.type === "tool-result") {
        // Send tool results to the frontend for task creation events etc.
        await sse.writeSSE({
          event: "tool_result",
          data:  JSON.stringify({ toolName: chunk.toolName, result: chunk.result }),
        });
      }
    }

    await sse.writeSSE({ event: "done", data: "" });
  });
});

// GET /api/v1/chat/conversations
chat.get("/conversations", async (c) => {
  const userId = c.get("userId") as string;
  const convs = await db.query.conversations.findMany({
    where: eq(conversations.userId, userId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });

  // Attach title from the first user message in each conversation
  const withTitles = await Promise.all(
    convs.map(async (conv) => {
      const firstMsg = await db.query.messages.findFirst({
        where: and(eq(messages.conversationId, conv.id), eq(messages.role, "user")),
        orderBy: (t) => asc(t.createdAt),
      });
      const title = firstMsg?.content
        ? firstMsg.content.slice(0, 60) + (firstMsg.content.length > 60 ? "…" : "")
        : null;
      return { ...conv, title };
    })
  );

  return c.json<ApiResponse<typeof withTitles>>({ data: withTitles, error: null });
});

// GET /api/v1/chat/conversations/:id/messages
chat.get("/conversations/:id/messages", async (c) => {
  const userId = c.get("userId") as string;
  const convId = c.req.param("id");

  const conv = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, convId), eq(conversations.userId, userId)),
  });
  if (!conv) return c.json<ApiResponse<null>>({ data: null, error: "not found" }, 404);

  const msgs = await db.query.messages.findMany({
    where: and(
      eq(messages.conversationId, convId),
      or(eq(messages.role, "user"), eq(messages.role, "assistant")),
    ),
    orderBy: (t) => asc(t.createdAt),
  });

  return c.json<ApiResponse<typeof msgs>>({ data: msgs, error: null });
});

export default chat;
