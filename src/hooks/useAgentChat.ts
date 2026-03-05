import { useState, useCallback, useRef } from "react";
import { streamAgentChat } from "../lib/api.js";

export interface AgentChatMessage {
  id:      string;
  role:    "user" | "assistant";
  content: string;
  taskCreated?: { taskId: string; agentName: string; title: string };
}

export function useAgentChat(agentName: string, initialConversationId?: string) {
  const [messages, setMessages]             = useState<AgentChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [streaming, setStreaming]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const abortRef                            = useRef(false);
  const assistantIdRef                      = useRef<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (streaming || !text.trim()) return;
    setError(null);
    abortRef.current       = false;
    assistantIdRef.current = null;

    const userMsg: AgentChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);

    try {
      await streamAgentChat(agentName, text, conversationId, (event, data) => {
        if (abortRef.current) return;
        if (event === "conversationId") {
          setConversationId(data);
        } else if (event === "text") {
          if (!assistantIdRef.current) {
            const id = crypto.randomUUID();
            assistantIdRef.current = id;
            setMessages(prev => [...prev, { id, role: "assistant", content: data }]);
          } else {
            const id = assistantIdRef.current;
            setMessages(prev => prev.map(m => m.id === id ? { ...m, content: m.content + data } : m));
          }
        } else if (event === "tool_result") {
          try {
            const result = JSON.parse(data);
            if (result.toolName === "create_task" && result.result?.taskId) {
              const id = assistantIdRef.current;
              if (id) {
                setMessages(prev => prev.map(m =>
                  m.id === id
                    ? { ...m, taskCreated: { taskId: result.result.taskId, agentName: result.result.agentName, title: result.result.title } }
                    : m
                ));
              }
            }
          } catch { /* not JSON */ }
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      const id = assistantIdRef.current;
      if (id) setMessages(prev => prev.filter(m => m.id !== id));
    } finally {
      setStreaming(false);
    }
  }, [streaming, conversationId, agentName]);

  return { messages, conversationId, streaming, error, sendMessage };
}
