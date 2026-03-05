import { useState, useCallback, useRef } from "react";
import { streamChat } from "../lib/api.js";

export interface ChatMessage {
  id:      string;
  role:    "user" | "assistant";
  content: string;
  // Shows a small card when ARIA creates a task
  taskCreated?: { taskId: string; agentName: string; title: string };
}

export function useAriaChat(initialConversationId?: string) {
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [streaming, setStreaming]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const abortRef                            = useRef(false);
  // Tracks the id of the in-flight assistant message (added on first text chunk)
  const assistantIdRef                      = useRef<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (streaming || !text.trim()) return;

    setError(null);
    abortRef.current  = false;
    assistantIdRef.current = null;

    // Optimistically add user message
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);

    try {
      await streamChat(text, conversationId, (event, data) => {
        if (abortRef.current) return;

        if (event === "conversationId") {
          setConversationId(data);
        } else if (event === "text") {
          if (!assistantIdRef.current) {
            // First text chunk — create the assistant message now (no empty bubble)
            const id = crypto.randomUUID();
            assistantIdRef.current = id;
            setMessages(prev => [...prev, { id, role: "assistant", content: data }]);
          } else {
            const id = assistantIdRef.current;
            setMessages(prev =>
              prev.map(m => m.id === id ? { ...m, content: m.content + data } : m)
            );
          }
        } else if (event === "tool_result") {
          try {
            const result = JSON.parse(data);
            if (result.toolName === "create_task" && result.result?.taskId) {
              const id = assistantIdRef.current;
              if (id) {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === id
                      ? { ...m, taskCreated: { taskId: result.result.taskId, agentName: result.result.agentName, title: result.result.title } }
                      : m
                  )
                );
              }
            }
          } catch {
            // Not JSON — ignore
          }
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      // Remove the in-flight assistant message on error
      const id = assistantIdRef.current;
      if (id) setMessages(prev => prev.filter(m => m.id !== id));
    } finally {
      setStreaming(false);
    }
  }, [streaming, conversationId]);

  return { messages, conversationId, streaming, error, sendMessage };
}
