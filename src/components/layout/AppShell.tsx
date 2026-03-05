import { useState, useEffect, useCallback } from "react";
import Sidebar, { type SidebarTab } from "./Sidebar.js";
import AriaChat from "../chat/AriaChat.js";
import MissionCenter from "../tasks/MissionCenter.js";
import SkillsPage from "../skills/SkillsPage.js";
import AgentsPage from "../agents/AgentsPage.js";
import { useTasks } from "../../hooks/useTasks.js";
import { getConversations } from "../../lib/api.js";
import type { User } from "@supabase/supabase-js";
import type { Conversation } from "../../../shared/types.js";

interface Props {
  user: User;
}

export default function AppShell({ user }: Props) {
  const [tab, setTab]                     = useState<SidebarTab>("chat");
  const [activeConvId, setActiveConvId]   = useState<string | undefined>();
  const [chatKey, setChatKey]             = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const { tasks } = useTasks(user.id);

  const loadConversations = useCallback(async () => {
    try { setConversations(await getConversations()); } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Called by AriaChat when a new conversation is auto-created mid-session.
  // Only updates sidebar state — does NOT change chatKey, so AriaChat stays mounted.
  function handleNewConversation(id: string) {
    setActiveConvId(id);
    loadConversations();
  }

  function handleNewChat() {
    setActiveConvId(undefined);
    setInitialPrompt(undefined);
    setChatKey(k => k + 1); // force remount → fresh empty state
    setTab("chat");
  }

  function handleSkillChat(prompt?: string) {
    setActiveConvId(undefined);
    setInitialPrompt(prompt);
    setChatKey(k => k + 1); // force remount so initialPrompt takes effect
    setTab("chat");
  }

  function handleSelectConversation(id: string) {
    setActiveConvId(id);
    setChatKey(k => k + 1); // force remount to load the selected conversation
    setTab("chat");
  }

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      <Sidebar
        activeTab={tab}
        onTabChange={setTab}
        tasks={tasks}
        userEmail={user.email ?? ""}
        conversations={conversations}
        activeConvId={activeConvId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "chat" && (
          <AriaChat
            key={chatKey}
            onNavigate={setTab}
            conversationId={activeConvId}
            onNewConversation={handleNewConversation}
            initialPrompt={initialPrompt}
            onInitialPromptConsumed={() => setInitialPrompt(undefined)}
            userName={user.email ?? ""}
          />
        )}
        {tab === "missions" && <MissionCenter userId={user.id} onChat={() => setTab("chat")} />}
        {tab === "skills"   && <SkillsPage onChat={handleSkillChat} />}
        {tab === "agents"   && <AgentsPage onNavigate={setTab} />}
      </main>
    </div>
  );
}
