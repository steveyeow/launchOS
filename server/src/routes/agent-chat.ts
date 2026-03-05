import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { streamAgentResponse } from "../agents/agent-conversations.js";
import { db, conversations, messages } from "../db/index.js";
import { eq, and, asc } from "drizzle-orm";
import type { ApiResponse } from "../../../shared/types.js";
import type { AppEnv } from "../lib/hono.js";

const agentChat = new Hono<AppEnv>();

// POST /api/v1/agents/:agentName/chat
agentChat.post("/:agentName/chat", async (c) => {
  const userId    = c.get("userId") as string;
  const agentName = c.req.param("agentName").toUpperCase();
  const { message, conversationId: existingId } = await c.req.json<{
    message: string;
    conversationId?: string;
  }>();

  if (!message?.trim()) {
    return c.json<ApiResponse<null>>({ data: null, error: "message is required" }, 400);
  }

  // Resolve or create conversation for this agent
  let conversationId = existingId;
  if (!conversationId) {
    const [conv] = await db.insert(conversations).values({
      userId,
      agentName,
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

  let stream: Awaited<ReturnType<typeof streamAgentResponse>>;
  try {
    stream = await streamAgentResponse(agentName, userId, conversationId, message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Agent unavailable";
    return c.json<ApiResponse<null>>({ data: null, error: msg }, 400);
  }

  return streamSSE(c, async (sse) => {
    await sse.writeSSE({ event: "conversationId", data: conversationId! });

    for await (const chunk of stream.fullStream) {
      if (chunk.type === "text-delta") {
        await sse.writeSSE({ event: "text", data: chunk.textDelta });
      } else if (chunk.type === "tool-result") {
        await sse.writeSSE({
          event: "tool_result",
          data:  JSON.stringify({ toolName: chunk.toolName, result: chunk.result }),
        });
      }
    }

    await sse.writeSSE({ event: "done", data: "" });
  });
});

// GET /api/v1/agents/:agentName/conversations
agentChat.get("/:agentName/conversations", async (c) => {
  const userId    = c.get("userId") as string;
  const agentName = c.req.param("agentName").toUpperCase();

  const convs = await db.query.conversations.findMany({
    where: and(eq(conversations.userId, userId), eq(conversations.agentName, agentName)),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });

  const withTitles = await Promise.all(
    convs.map(async (conv) => {
      const firstMsg = await db.query.messages.findFirst({
        where:   and(eq(messages.conversationId, conv.id), eq(messages.role, "user")),
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

export default agentChat;
