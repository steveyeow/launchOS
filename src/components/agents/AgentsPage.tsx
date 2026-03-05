import { forwardRef, useEffect, useRef, useState } from "react";
import { T } from "../../lib/theme.js";
import { useAgentChat } from "../../hooks/useAgentChat.js";
import { getAgentConversations } from "../../lib/api.js";
import type { Conversation } from "../../../shared/types.js";

const AGENTS = [
  {
    name:       "GEO",
    tagline:    "AI Engine Optimization auditing",
    color:      "#0891B2",
    status:     "active" as const,
    desc:       "Audits any website for GEO status — AI bot access, llms.txt, structured data, and content quality. Produces a scored report with prioritized fixes.",
    caps:       ["AI bot access check", "llms.txt validation", "JSON-LD audit", "Content quality score", "Priority fix list"],
    platforms:  ["Any website"],
    starter:    "Check the GEO status of https://",
  },
  {
    name:       "SCOUT",
    tagline:    "Signal finding & ICP prospecting",
    color:      "#2563EB",
    status:     "active" as const,
    desc:       "Finds posts where people express the pain your product solves, and ICP-matching people on Twitter, LinkedIn, and Reddit. Drafts personalized outreach.",
    caps:       ["Signal post finding", "ICP people search", "Outreach drafting"],
    platforms:  ["Twitter/X", "LinkedIn", "Reddit"],
    starter:    "I want to find signal posts about ",
  },
  {
    name:       "PULSE",
    tagline:    "Twitter content & thought leadership",
    color:      "#D97706",
    status:     "soon" as const,
    desc:       "Builds your brand on Twitter — writes threads aligned with your ICP's pain points, joins conversations, grows your audience.",
    caps:       ["Thread writing", "Trend monitoring", "Engagement replies", "Audience building"],
    platforms:  ["Twitter/X"],
    starter:    "",
  },
  {
    name:       "FORGE",
    tagline:    "SEO blog content pipeline",
    color:      "#7C3AED",
    status:     "soon" as const,
    desc:       "Researches keywords your ICP searches for, writes SEO-optimized blog posts, maintains your content calendar.",
    caps:       ["Keyword research", "Blog writing", "On-page SEO", "Content calendar"],
    platforms:  ["Blog / CMS"],
    starter:    "",
  },
  {
    name:       "COMMUNITY",
    tagline:    "Discord & Telegram distribution",
    color:      "#059669",
    status:     "soon" as const,
    desc:       "Finds Discord servers and Telegram groups where your ICP gathers. Drafts authentic intro messages for human review.",
    caps:       ["Community discovery", "Intro drafting", "Relevance scoring"],
    platforms:  ["Discord", "Telegram"],
    starter:    "",
  },
  {
    name:       "HERALD",
    tagline:    "Email newsletter & nurture",
    color:      "#BE185D",
    status:     "soon" as const,
    desc:       "Writes and sends your newsletter, builds drip sequences, tracks open rates.",
    caps:       ["Newsletter writing", "Drip sequences", "A/B testing", "Segment targeting"],
    platforms:  ["Email"],
    starter:    "",
  },
];

interface Props {
  onNavigate: (tab: "missions") => void;
}

export default function AgentsPage({ onNavigate }: Props) {
  const [selectedName, setSelectedName] = useState<string>(AGENTS[0].name);
  const agent = AGENTS.find(a => a.name === selectedName) ?? AGENTS[0];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left — agent list */}
      <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Agents</h2>
          <p style={{ fontSize: 11, color: T.textDim, marginTop: 3, fontFamily: T.mono }}>Select an agent to chat</p>
        </div>
        <div style={{ padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {AGENTS.map(a => (
            <AgentListItem
              key={a.name}
              agent={a}
              selected={selectedName === a.name}
              onClick={() => setSelectedName(a.name)}
            />
          ))}
        </div>
      </div>

      {/* Right — chat panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {agent.status === "active"
          ? <AgentChatPanel key={agent.name} agent={agent} onNavigate={onNavigate} />
          : <ComingSoonPanel agent={agent} />
        }
      </div>
    </div>
  );
}

// ── Agent list item ────────────────────────────────────────────────────────────

function AgentListItem({ agent, selected, onClick }: { agent: typeof AGENTS[0]; selected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: selected ? T.sidebarAct : hov ? T.sidebarHov : "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
    >
      <AgentAvatar name={agent.name} color={agent.color} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: selected ? 500 : 400, color: selected ? T.text : T.textMid, fontFamily: T.mono }}>{agent.name}</div>
        <div style={{ fontSize: 10, color: T.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.tagline}</div>
      </div>
      {agent.status === "soon" && (
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, background: T.bg, borderRadius: 100, padding: "1px 5px", border: `1px solid ${T.border}`, flexShrink: 0 }}>soon</span>
      )}
      {agent.status === "active" && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, flexShrink: 0 }} />
      )}
    </button>
  );
}

// ── Coming soon panel ─────────────────────────────────────────────────────────

function ComingSoonPanel({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 16 }}>
      <AgentAvatar name={agent.name} color={agent.color} size={52} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 500, color: agent.color, marginBottom: 4 }}>{agent.name}</div>
        <div style={{ fontSize: 13, color: T.textMid, marginBottom: 16 }}>{agent.tagline}</div>
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, maxWidth: 380, marginBottom: 20 }}>{agent.desc}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
          {agent.caps.map(c => (
            <span key={c} style={{ fontSize: 11, color: agent.color, background: `${agent.color}10`, borderRadius: 6, padding: "3px 9px", fontFamily: T.mono }}>{c}</span>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "inline-block", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 100, padding: "4px 14px", fontSize: 11, fontFamily: T.mono, color: T.textDim }}>
          Coming soon
        </div>
      </div>
    </div>
  );
}

// ── Active agent chat panel ───────────────────────────────────────────────────

function AgentChatPanel({ agent, onNavigate }: { agent: typeof AGENTS[0]; onNavigate: (tab: "missions") => void }) {
  const [convId, setConvId]           = useState<string | undefined>();
  const [conversations, setConvs]     = useState<Conversation[]>([]);
  const { messages, streaming, error, sendMessage, conversationId } = useAgentChat(agent.name, convId);
  const [input, setInput]             = useState("");
  const endRef                        = useRef<HTMLDivElement>(null);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);

  // Load previous conversations for this agent
  useEffect(() => {
    getAgentConversations(agent.name).then(setConvs).catch(() => {});
  }, [agent.name]);

  useEffect(() => {
    if (conversationId && conversationId !== convId) {
      setConvId(conversationId);
      getAgentConversations(agent.name).then(setConvs).catch(() => {});
    }
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function submit(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    sendMessage(msg);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  const isEmpty        = messages.length === 0 && !streaming;
  const lastMsg        = messages[messages.length - 1];
  const showThinking   = streaming && (!lastMsg || lastMsg.role === "user");

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* History sidebar (inside chat panel) */}
      {conversations.length > 0 && (
        <div style={{ width: 160, flexShrink: 0, borderRight: `1px solid ${T.border}`, overflowY: "auto", padding: "10px 6px" }}>
          <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.mono, padding: "2px 8px 6px", letterSpacing: 0.4, textTransform: "uppercase" }}>History</div>
          <button
            onClick={() => { setConvId(undefined); }}
            style={{ width: "100%", padding: "5px 8px", borderRadius: 5, background: !convId ? T.sidebarAct : "transparent", border: "none", fontSize: 11, color: !convId ? T.text : T.textDim, cursor: "pointer", textAlign: "left" }}
          >
            + New chat
          </button>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setConvId(conv.id)}
              style={{ width: "100%", padding: "5px 8px", borderRadius: 5, background: convId === conv.id ? T.sidebarAct : "transparent", border: "none", fontSize: 11, color: convId === conv.id ? T.text : T.textDim, cursor: "pointer", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              title={conv.title ?? "Conversation"}
            >
              {conv.title ?? "Conversation"}
            </button>
          ))}
        </div>
      )}

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Agent header */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <AgentAvatar name={agent.name} color={agent.color} size={32} />
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, color: agent.color }}>{agent.name}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>{agent.tagline}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {agent.platforms.map(p => (
              <span key={p} style={{ fontSize: 10, color: agent.color, background: `${agent.color}10`, borderRadius: 5, padding: "2px 7px", fontFamily: T.mono }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", animation: "fadeUp .3s ease" }}>
            <AgentAvatar name={agent.name} color={agent.color} size={44} />
            <p style={{ fontSize: 14, color: T.textMid, marginTop: 14, marginBottom: 24, textAlign: "center", maxWidth: 340, lineHeight: 1.65 }}>
              {agent.desc}
            </p>
            {agent.starter && (
              <button
                onClick={() => { setInput(agent.starter); textareaRef.current?.focus(); }}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: T.textMid, cursor: "pointer", fontFamily: T.mono }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid; }}
              >
                {agent.starter}…
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        {!isEmpty && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg, i) => (
                <AgentMessage
                  key={msg.id}
                  message={msg}
                  agent={agent}
                  isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
                  onViewMissions={() => onNavigate("missions")}
                />
              ))}
              {showThinking && <AgentThinking agent={agent} />}
              {error && (
                <div style={{ fontSize: 12, color: "#dc2626", fontFamily: T.mono, padding: "8px 12px", background: "#fef2f2", borderRadius: 6 }}>
                  {error}
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "10px 20px 16px", borderTop: isEmpty ? "none" : `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <AgentInputBox
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              onSubmit={() => submit()}
              streaming={streaming}
              color={agent.color}
              placeholder={`Message ${agent.name}…`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function AgentMessage({ message, agent, isStreaming, onViewMissions }: { message: { id: string; role: "user" | "assistant"; content: string; taskCreated?: { taskId: string; agentName: string; title: string } }; agent: typeof AGENTS[0]; isStreaming: boolean; onViewMissions: () => void }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", gap: 8, flexDirection: isUser ? "row-reverse" : "row", animation: "slideIn .2s ease" }}>
      {!isUser && <AgentAvatar name={agent.name} color={agent.color} size={26} />}
      <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: 5, alignItems: isUser ? "flex-end" : "flex-start" }}>
        {!isUser && <span style={{ fontSize: 10, color: agent.color, fontFamily: T.mono, letterSpacing: .5 }}>{agent.name}</span>}
        <div style={{ background: isUser ? T.text : T.surface, color: isUser ? "#fff" : T.text, border: isUser ? "none" : `1px solid ${T.border}`, borderRadius: isUser ? "12px 12px 4px 12px" : "4px 12px 12px 12px", padding: "9px 13px", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {message.content}
          {isStreaming && <span style={{ display: "inline-block", width: 2, height: 13, background: T.textDim, marginLeft: 2, verticalAlign: "middle", animation: "blink 1s infinite" }} />}
        </div>
        {message.taskCreated && (
          <div style={{ background: T.greenLight, border: `1px solid ${T.greenMid}`, borderRadius: 7, padding: "7px 11px", fontSize: 11, color: "#166534", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: T.mono, fontWeight: 500 }}>{message.taskCreated.agentName}</span>
            <span style={{ color: T.green }}>task created:</span>
            <span>{message.taskCreated.title}</span>
            <button onClick={onViewMissions} style={{ marginLeft: "auto", background: "none", border: "none", color: T.green, fontSize: 10, fontFamily: T.mono, cursor: "pointer", textDecoration: "underline" }}>view →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentThinking({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <AgentAvatar name={agent.name} color={agent.color} size={26} />
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "9px 13px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "4px 12px 12px 12px" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.textDim, display: "inline-block", animation: `pulse 1.2s ${i * .2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ── Input box ─────────────────────────────────────────────────────────────────

interface InputProps {
  value:       string;
  onChange:    (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown:   (e: React.KeyboardEvent) => void;
  onSubmit:    () => void;
  streaming:   boolean;
  color:       string;
  placeholder: string;
}

const AgentInputBox = forwardRef<HTMLTextAreaElement, InputProps>(
  ({ value, onChange, onKeyDown, onSubmit, streaming, color, placeholder }, ref) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: "9px 11px" }}>
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: T.text, fontFamily: T.sans, resize: "none", lineHeight: 1.6, outline: "none" }}
      />
      <button
        onClick={onSubmit}
        disabled={streaming || !value.trim()}
        style={{ background: value.trim() && !streaming ? color : T.border, color: value.trim() && !streaming ? "#fff" : T.textDim, border: "none", borderRadius: 7, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s", cursor: value.trim() && !streaming ? "pointer" : "default" }}
      >
        {streaming ? <MiniSpinner /> : <SendIcon />}
      </button>
    </div>
  )
);

// ── Shared visuals ────────────────────────────────────────────────────────────

function AgentAvatar({ name, color, size }: { name: string; color: string; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.mono, fontSize: size * 0.38, fontWeight: 600, color }}>{name[0]}</span>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M12 7L2 2l2.5 5L2 12l10-5z" fill="currentColor" />
    </svg>
  );
}

function MiniSpinner() {
  return <span style={{ width: 13, height: 13, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .6s linear infinite" }} />;
}
