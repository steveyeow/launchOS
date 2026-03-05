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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const { tasks } = useTasks(user.id);

  const loadConversations = useCallback(async () => {
    try { setConversations(await getConversations()); } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  function handleNewConversation(id: string) {
    setActiveConvId(id);
    loadConversations();
  }

  function handleNewChat() {
    setActiveConvId(undefined);
    setInitialPrompt(undefined);
    setTab("chat");
  }

  function handleSkillChat(prompt?: string) {
    setActiveConvId(undefined);
    setInitialPrompt(prompt);
    setTab("chat");
  }

  function handleSelectConversation(id: string) {
    setActiveConvId(id);
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
            key={activeConvId ?? "new"}
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
