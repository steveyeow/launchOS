import { useState } from "react";
import { T } from "../../lib/theme.js";

interface TeamAgent {
  name: string;
  color: string;
  activity: string;
  platform: string;
  platformIcon: "twitter" | "reddit" | "linkedin" | "communities" | "tiktok" | "all";
  stats: { label: string; value: string }[];
}

const MY_TEAM: TeamAgent[] = [
  {
    name:         "ARIA",
    color:        "#1a1714",
    activity:     "Coordinating your GTM strategy & managing all agents",
    platform:     "All platforms",
    platformIcon: "all",
    stats:        [{ label: "Agents managed", value: "5" }, { label: "Tasks today", value: "23" }],
  },
  {
    name:         "Twitter Manager",
    color:        "#D97706",
    activity:     "Replying to 3 signal posts & drafting a thread",
    platform:     "Twitter/X",
    platformIcon: "twitter",
    stats:        [{ label: "Replies today", value: "8" }, { label: "Impressions", value: "2.4k" }],
  },
  {
    name:         "Reddit Scout",
    color:        "#FF4500",
    activity:     "Monitoring r/SaaS and r/startups for buying signals",
    platform:     "Reddit",
    platformIcon: "reddit",
    stats:        [{ label: "Signals found", value: "14" }, { label: "Communities", value: "6" }],
  },
  {
    name:         "Lead Finder",
    color:        "#0A66C2",
    activity:     "Finding VP Marketing leads matching your ICP",
    platform:     "LinkedIn + Twitter",
    platformIcon: "linkedin",
    stats:        [{ label: "Leads found", value: "32" }, { label: "Outreach sent", value: "12" }],
  },
  {
    name:         "Community Finder",
    color:        "#059669",
    activity:     "Discovered 3 new Discord servers with your ICP",
    platform:     "Discord, Reddit, X",
    platformIcon: "communities",
    stats:        [{ label: "Groups found", value: "18" }, { label: "Active leads", value: "45" }],
  },
  {
    name:         "Content Studio",
    color:        "#E11D48",
    activity:     "Creating short-form video for TikTok launch",
    platform:     "TikTok",
    platformIcon: "tiktok",
    stats:        [{ label: "Posts created", value: "5" }, { label: "Views", value: "890" }],
  },
];

export const AGENTS = [
  {
    name:       "ARIA",
    tagline:    "Your strategic GTM advisor — discusses strategy, coordinates agents, and keeps everything aligned",
    color:      "#1a1714",
    status:     "active" as const,
    caps:       ["GTM strategy", "Agent coordination", "Market analysis", "Campaign planning"],
    platforms:  ["All platforms"],
    starter:    "Let's discuss my GTM strategy — here's what I'm working on ",
  },
  {
    name:       "Twitter Manager",
    tagline:    "Runs your Twitter — finds signal posts, replies with value, publishes threads & tweets automatically",
    color:      "#D97706",
    status:     "active" as const,
    caps:       ["Signal post replies", "Thread writing", "Engagement", "Trend monitoring"],
    platforms:  ["Twitter/X"],
    starter:    "Run my Twitter account — find signal posts and engage with them ",
  },
  {
    name:       "Reddit Scout",
    tagline:    "Finds signal communities and posts on Reddit, engages authentically in relevant conversations",
    color:      "#FF4500",
    status:     "active" as const,
    caps:       ["Subreddit discovery", "Signal post finding", "Comment engagement", "Community monitoring"],
    platforms:  ["Reddit"],
    starter:    "Find Reddit communities where people discuss problems my product solves ",
  },
  {
    name:       "Lead Finder",
    tagline:    "Finds ICP-matching leads and decision makers across LinkedIn, Twitter, and Reddit",
    color:      "#0A66C2",
    status:     "active" as const,
    caps:       ["ICP lead search", "Decision maker targeting", "Outreach drafting", "Multi-platform"],
    platforms:  ["LinkedIn", "Twitter/X", "Reddit"],
    starter:    "Find 50 leads matching my ICP on LinkedIn and Twitter ",
  },
  {
    name:       "Community Finder",
    tagline:    "Discovers relevant communities, Discord servers, Twitter groups, and Reddit spaces where your ICP gathers",
    color:      "#059669",
    status:     "active" as const,
    caps:       ["Community discovery", "Discord server finding", "Group relevance scoring", "Intro drafting"],
    platforms:  ["Discord", "Twitter/X", "Reddit"],
    starter:    "Find Discord servers and communities where my target audience hangs out ",
  },
  {
    name:       "Content Studio",
    tagline:    "Creates images, copy, and short-form videos for TikTok and social media publishing",
    color:      "#E11D48",
    status:     "active" as const,
    caps:       ["Image generation", "Video creation", "Copywriting", "TikTok publishing"],
    platforms:  ["TikTok", "Social Media"],
    starter:    "Create content for my TikTok — understand my product and make engaging videos ",
  },
  {
    name:       "Email Agent",
    tagline:    "Automates cold email campaigns, newsletters, and drip sequences at scale",
    color:      "#8B5CF6",
    status:     "soon" as const,
    caps:       ["Cold email", "Drip sequences", "Newsletter", "A/B testing"],
    platforms:  ["Email"],
    starter:    "",
  },
  {
    name:       "GEO Optimizer",
    tagline:    "Makes your site visible to AI search engines like ChatGPT, Perplexity & Claude",
    color:      "#0891B2",
    status:     "active" as const,
    caps:       ["AI bot access", "llms.txt audit", "Structured data", "AI visibility score"],
    platforms:  ["Any website"],
    starter:    "Check the GEO status of https://",
  },
  {
    name:       "SEO Writer",
    tagline:    "Researches keywords, writes SEO-optimized content, and builds your organic traffic pipeline",
    color:      "#7C3AED",
    status:     "soon" as const,
    caps:       ["Keyword research", "SEO content", "On-page optimization", "Content calendar"],
    platforms:  ["Blog / CMS"],
    starter:    "",
  },
  {
    name:       "Ad Manager",
    tagline:    "Plans, launches, and optimizes paid ad campaigns across platforms",
    color:      "#DC2626",
    status:     "soon" as const,
    caps:       ["Campaign planning", "Ad creative", "Budget optimization", "Performance tracking"],
    platforms:  ["Google Ads", "Meta Ads", "LinkedIn Ads"],
    starter:    "",
  },
] as const;

export type AgentInfo = (typeof AGENTS)[number];

interface Props {
  onNavigate: (tab: "missions") => void;
  onChatWithAgent: (agent: AgentInfo) => void;
}

export default function AgentsPage({ onNavigate, onChatWithAgent }: Props) {
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: T.mono }}>Agents</h2>
        <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Your AI GTM team — working around the clock across every channel.</p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <SectionHeader label="Your Team" count={MY_TEAM.length} color={T.green} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {MY_TEAM.slice(0, 3).map((agent, i) => <TeamCard key={i} agent={agent} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 14 }}>
          {MY_TEAM.slice(3).map((agent, i) => <TeamCard key={i + 3} agent={agent} />)}
        </div>
      </div>

      <div>
        {(() => {
          const teamNames = new Set(MY_TEAM.map(a => a.name));
          const available = AGENTS.filter(a => !teamNames.has(a.name));
          return (
            <>
              <SectionHeader label="Available to Hire" count={available.length} color={T.textDim} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {available.map(agent => <HireCard key={agent.name} agent={agent} onChat={onChatWithAgent} />)}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: T.mono, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 500, color, background: `${color}14`, borderRadius: 100, padding: "2px 8px" }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function TeamCard({ agent }: { agent: TeamAgent }) {
  const [hov, setHov] = useState(false);
  const initials = agent.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: T.surface, border: `1px solid ${hov ? agent.color + "40" : T.border}`,
      borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12,
      transition: "border-color .15s ease", position: "relative",
    }}>
      <span style={{
        position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5,
        fontSize: 10, fontFamily: T.mono, fontWeight: 500, color: T.green, background: T.greenLight,
        borderRadius: 100, padding: "3px 10px", border: `1px solid ${T.greenMid}`,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 2s infinite" }} />
        Working
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AgentAvatar initials={initials} color={agent.color} size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{agent.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <PlatformIcon type={agent.platformIcon} color={T.textDim} />
            <span style={{ fontSize: 10, color: T.textDim }}>{agent.platform}</span>
          </div>
        </div>
      </div>

      <div style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}18`, borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 10, fontFamily: T.mono, color: agent.color, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Task</div>
        <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{agent.activity}</div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {agent.stats.map(s => (
          <div key={s.label} style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text, fontFamily: T.mono }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HireCard({ agent, onChat }: { agent: AgentInfo; onChat: (a: AgentInfo) => void }) {
  const [hov, setHov] = useState(false);
  const isSoon = agent.status === "soon";
  const initials = agent.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: T.surface, border: `1px solid ${hov ? agent.color + "40" : T.border}`,
      borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12,
      transition: "border-color .15s ease", position: "relative", opacity: isSoon ? 0.7 : 1,
    }}>
      {isSoon && (
        <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontFamily: T.mono, fontWeight: 500, color: T.textDim, background: T.bg, borderRadius: 100, padding: "3px 10px", border: `1px solid ${T.border}` }}>Coming Soon</span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AgentAvatar initials={initials} color={agent.color} size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{agent.name}</div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{agent.platforms.join(", ")}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6, margin: 0, flex: 1 }}>{agent.tagline}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {agent.caps.slice(0, 3).map(c => <span key={c} style={{ fontSize: 10, color: agent.color, background: `${agent.color}14`, borderRadius: 5, padding: "3px 8px", fontFamily: T.mono }}>{c}</span>)}
      </div>
      <button onClick={() => !isSoon && onChat(agent)} style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "9px 16px", background: isSoon ? T.border : (hov ? agent.color : `${agent.color}12`),
        color: isSoon ? T.textDim : (hov ? "#fff" : agent.color),
        border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, fontFamily: T.mono,
        cursor: isSoon ? "default" : "pointer", transition: "background .15s, color .15s",
      }}>
        {isSoon ? "Coming Soon" : "Hire this Agent"}
      </button>
    </div>
  );
}

function AgentAvatar({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: T.mono, fontSize: size * 0.32, fontWeight: 600, color }}>{initials}</span>
    </div>
  );
}

function PlatformIcon({ type, color }: { type: TeamAgent["platformIcon"]; color: string }) {
  const s = { width: 11, height: 11 };
  if (type === "twitter") return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.7 16h4.3M4 20l6.8-9.2M20.6 4h-4.3L11 10" /></svg>;
  if (type === "linkedin") return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
  if (type === "reddit") return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="8" /><path d="M12 6V2M16 2l-4 4-4-4" /><circle cx="8.5" cy="13" r="1" fill={color} /><circle cx="15.5" cy="13" r="1" fill={color} /><path d="M9 17c1.5 1 4.5 1 6 0" /></svg>;
  if (type === "communities") return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
  if (type === "all") return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" /></svg>;
  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
}
