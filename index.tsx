
import { useState, useEffect, useRef, type ReactNode } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Inter', sans-serif; background: #f4f2ed; }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:none} }
  @keyframes slideUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  @keyframes dot     { 0%,80%,100%{opacity:.15} 40%{opacity:.9} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  button { font-family: inherit; cursor: pointer; }
  button:focus, input:focus, textarea:focus { outline: none; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #4a4540; border-radius: 2px; }
`;

/* sidebar dark, main warm white — matching Claude.ai palette */
const S = {
  /* sidebar */
  sidebarBg:   "#f4f2ed",
  sidebarHov:  "#eceae4",
  sidebarAct:  "#dedad2",
  sidebarText: "#1a1714",
  sidebarDim:  "#9a9690",
  sidebarSec:  "#9a9690",

  /* main */
  mainBg:    "#f4f2ed",
  surface:   "#ffffff",
  surfaceHov:"#eeece7",
  border:    "#e4e1d8",
  borderMid: "#ccc9c0",

  /* text */
  text:    "#1a1714",
  textMid: "#6b6760",
  textDim: "#a8a49e",

  /* accent */
  green:      "#16a34a",
  greenLight: "#dcfce7",
  greenMid:   "#86efac",

  mono: "'DM Mono', monospace",
  sans: "'Inter', sans-serif",
  // Claude-like greeting serif: prefer OS UI serif (macOS ≈ New York), then Georgia.
  serif:'ui-serif, "New York", Georgia, Cambria, "Times New Roman", Times, serif',
};

type LandingRole = "agent" | "user" | "sys";
type LandingLine = { role: LandingRole; text: string; id: number; live?: boolean; isDash?: boolean };

type ChatRole = "agent" | "user";
type ChatLine = { role: ChatRole; text: string; id: number; live?: boolean };

type Stat = { label: string; v: string; sub: string };
type HistoryItem = { id: number; label: string };

/* ── Typewriter ──────────────────────────────────────────── */
type TypewriterProps = {
  text: string;
  speed?: number;
  onDone?: () => void;
  dashCb?: () => void;
};

function Typewriter({ text, speed = 16, onDone, dashCb }: TypewriterProps) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++; setOut(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);

  const render = (t: string): ReactNode => {
    if (!dashCb || !t.includes("dashboard")) return t;
    return t.split(/(dashboard)/i).map((p: string, i: number) =>
      p.toLowerCase() === "dashboard"
        ? <span key={i} onClick={dashCb} style={{ color: S.green, textDecoration: "underline", textDecorationStyle: "dotted", cursor: "pointer" }}>dashboard</span>
        : p
    );
  };
  if (!done) return <span>{out}<span style={{ animation: "blink .65s step-end infinite", color: S.green }}>|</span></span>;
  return <span>{render(text)}</span>;
}

/* ── Landing Terminal ────────────────────────────────────── */
const DEMO: Array<Omit<LandingLine, "id" | "live">> = [
  { role: "agent", text: "Hi, I'm ARIA. Tell me about your product and who you want to reach." },
  { role: "user",  text: "B2B SaaS for logistics ops teams. Mid-market US companies." },
  { role: "agent", text: "Got you. Mapping your ICP — ops managers and supply chain directors at 200–2000 person companies in freight and 3PL.\n\nDeploying your agents now..." },
  { role: "sys",   text: "✓ SCOUT (LinkedIn outreach)   ✓ PULSE (Twitter)   ✓ FORGE (SEO)" },
  { role: "agent", text: "Your marketing team is live. Head to your dashboard →", isDash: true },
];

function LandingTerminal({ onEnter }: { onEnter: () => void }) {
  const [lines, setLines]   = useState<LandingLine[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep]     = useState(0);
  const [val, setVal]       = useState("");
  const [wait, setWait]     = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => {
    if (step >= DEMO.length || typing || wait) return;
    const item = DEMO[step];
    if (item.role === "user") { setWait(true); return; }
    const t = setTimeout(() => { setTyping(true); setLines(l => [...l, { ...item, id: step, live: true }]); }, step === 0 ? 500 : 700);
    return () => clearTimeout(t);
  }, [step, typing, wait]);
  const done = () => { setTyping(false); setStep(s => s + 1); };
  const send = () => { if (!val.trim()) return; setLines(l => [...l, { role: "user", text: val, id: step }]); setVal(""); setWait(false); setStep(s => s + 1); };

  return (
    <div style={{ background: "#fafaf8", border: `1px solid ${S.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "9px 14px", background: "#e8e5de", display: "flex", alignItems: "center", gap: 6 }}>
        {["#FF6057","#FFBD2E","#28CA41"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: S.textDim, fontFamily: S.mono }}>getu.ai</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 6px" }}>
        {lines.map(line => {
          const isLive = line.live && lines[lines.length - 1]?.id === line.id;
          return (
            <div key={line.id} style={{ marginBottom: 14, animation: "slideIn .2s ease" }}>
              {line.role === "agent" && <>
                <div style={{ fontSize: 10, color: S.green, fontFamily: S.mono, marginBottom: 3 }}>ARIA</div>
                <div style={{ fontSize: 13, color: S.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {isLive ? <Typewriter text={line.text} onDone={done} dashCb={line.isDash ? onEnter : undefined} />
                    : line.isDash ? line.text.split(/(dashboard)/i).map((p, i) => p.toLowerCase() === "dashboard" ? <span key={i} onClick={onEnter} style={{ color: S.green, textDecoration: "underline", cursor: "pointer" }}>dashboard</span> : p)
                    : line.text}
                </div>
              </>}
              {line.role === "user" && <>
                <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.mono, marginBottom: 3 }}>YOU</div>
                <div style={{ fontSize: 13, color: S.textMid }}>{line.text}</div>
              </>}
              {line.role === "sys" && (
                <div style={{ fontSize: 11, color: S.green, background: S.greenLight, border: `1px solid ${S.greenMid}`, padding: "6px 10px", borderRadius: 6, fontFamily: S.mono }}>
                  {isLive ? <Typewriter text={line.text} speed={13} onDone={done} /> : line.text}
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${S.border}`, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: S.green, fontFamily: S.mono, fontSize: 13 }}>›</span>
        <input disabled={!wait} placeholder={wait ? DEMO[step]?.text : "waiting..."} value={val}
          onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          style={{ flex: 1, border: "none", background: "transparent", fontFamily: S.mono, fontSize: 12, color: wait ? S.text : S.textDim }} />
        {wait && <button onClick={send} style={{ background: S.green, color: "#fff", border: "none", padding: "4px 10px", borderRadius: 5, fontSize: 11, fontFamily: S.mono }}>↵</button>}
      </div>
    </div>
  );
}

/* ── Landing Page ────────────────────────────────────────── */
function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: S.mainBg, overflow: "hidden" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 52, borderBottom: `1px solid ${S.border}`, flexShrink: 0 }}>
        <span style={{ fontFamily: S.mono, fontSize: 14, fontWeight: 500, color: S.text }}>getu<span style={{ color: S.green }}>.ai</span></span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "none", border: "none", fontSize: 14, color: S.textMid, padding: "7px 14px" }}>Sign in</button>
          <button onClick={onEnter} style={{ background: S.text, color: "#fff", border: "none", padding: "7px 18px", borderRadius: 7, fontSize: 14, fontWeight: 500 }}>Get started →</button>
        </div>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px", gap: 56, overflow: "hidden" }}>
        <div style={{ flex: "0 0 50%", animation: "fadeUp .45s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 100, border: `1px solid ${S.greenMid}`, background: S.greenLight, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: S.green, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: S.green, fontFamily: S.mono }}>open beta</span>
          </div>
          <h1 style={{ fontFamily: S.serif, fontSize: 36, lineHeight: 1.2, color: S.text, marginBottom: 16, fontWeight: 400 }}>
            Meet your AI marketing team,<br /><span style={{ color: S.green }}>ready to deploy.</span>
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: S.textMid, marginBottom: 26, maxWidth: 420 }}>
            Describe your product. ARIA learns your goals, maps your ICP, builds the strategy, and deploys specialist agents that find leads, publish content, run outreach, and report back — all on autopilot.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={onEnter} style={{ background: S.text, color: "#fff", border: "none", padding: "11px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Create your sandbox →</button>
            <span style={{ fontSize: 12, color: S.textDim, fontFamily: S.mono }}>no setup needed</span>
          </div>
        </div>
        <div style={{ flex: "0 0 46%", height: "calc(100% - 120px)", maxHeight: 400, animation: "fadeUp .45s .1s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <LandingTerminal onEnter={onEnter} />
          <p style={{ marginTop: 8, fontSize: 11, color: S.textDim, fontFamily: S.mono, textAlign: "center" }}>↑ interactive demo</p>
        </div>
      </div>
    </div>
  );
}

/* ── App Home ────────────────────────────────────────────── */
const SUGGESTED = [
  { name: "SCOUT", color: "#2563EB", label: "LinkedIn prospecting & outreach" },
  { name: "PULSE", color: "#D97706", label: "Twitter content & thought leadership" },
  { name: "FORGE", color: "#7C3AED", label: "SEO blog writing & content pipeline" },
];
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function AppHome({ onStart }: { onStart: (msg: string) => void }) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const resize = () => { const el = ref.current; if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; };
  const submit = (v?: string) => { if ((v ?? val).trim()) onStart((v ?? val).trim()); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", marginTop: -160 }}>
      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, animation: "fadeUp .4s ease both" }}>
        <svg width="36" height="36" viewBox="0 0 8 8" style={{ imageRendering: "pixelated", flexShrink: 0 }}>
          {/* antenna */}
          <rect x="3" y="0" width="2" height="1" fill={S.green}/>
          {/* head */}
          <rect x="1" y="1" width="6" height="5" fill="#c8c4bc"/>
          {/* eyes */}
          <rect x="2" y="2" width="1" height="2" fill={S.green}/>
          <rect x="5" y="2" width="1" height="2" fill={S.green}/>
          {/* mouth */}
          <rect x="2" y="5" width="4" height="1" fill={S.green}/>
        </svg>
        <h2 style={{ fontFamily: S.serif, fontSize: 38, fontWeight: 400, color: S.text, letterSpacing: -0.2 }}>
          Afternoon, Jordan
        </h2>
      </div>

      {/* Composer — wide, Claude-style */}
      <div style={{
        width: "100%", maxWidth: 680,
        background: S.surface, border: `1.5px solid ${S.borderMid}`,
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        animation: "fadeUp .4s .07s ease both", opacity: 0, animationFillMode: "forwards",
      }}>
        <textarea ref={ref} rows={3} value={val}
          onChange={e => { setVal(e.target.value); resize(); }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="How can I help you today?"
          style={{ width: "100%", border: "none", background: "transparent", padding: "16px 18px 10px", fontFamily: S.sans, fontSize: 15, color: S.text, lineHeight: 1.5, resize: "none", minHeight: 80, display: "block" }}
        />
        <div style={{ padding: "6px 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: S.textDim, fontFamily: S.mono }}>shift+↵ newline</span>
          <button onClick={() => submit()} style={{ background: val.trim() ? S.text : S.border, color: val.trim() ? "#fff" : S.textDim, border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, transition: "background .12s, color .12s" }}>Send</button>
        </div>
      </div>

      {/* Suggested agents */}
      <div style={{ width: "100%", maxWidth: 680, marginTop: 12, display: "flex", gap: 8, animation: "fadeUp .4s .14s ease both", opacity: 0, animationFillMode: "forwards" }}>
        {SUGGESTED.map(ag => (
          <button key={ag.name} onClick={() => submit(`I'd like to work with ${ag.name} — ${ag.label}`)}
            style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: "11px 14px", textAlign: "left", transition: "border-color .12s, background .12s" }}
            onMouseEnter={e => { e.currentTarget.style.background = S.surfaceHov; e.currentTarget.style.borderColor = S.borderMid; }}
            onMouseLeave={e => { e.currentTarget.style.background = S.surface; e.currentTarget.style.borderColor = S.border; }}
          >
            <div style={{ fontFamily: S.mono, fontSize: 11, color: ag.color, marginBottom: 4, fontWeight: 500 }}>{ag.name}</div>
            <div style={{ fontSize: 12, color: S.textMid, lineHeight: 1.4 }}>{ag.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Task Conversation ───────────────────────────────────── */
const REPLIES: Array<Omit<ChatLine, "id" | "live">> = [
  { role: "agent", text: "On it. Mapping your ICP and thinking through the strategy.\n\n◈  Decision makers: VP Ops, Supply Chain Directors\n◈  Firmographics: 200–2000 employees, US, freight / 3PL\n◈  Pain signals: freight visibility, carrier delays, dwell time\n\nI'd recommend LinkedIn outreach to reach decision makers directly, and Twitter for category authority. Which channels first?" },
  { role: "user",  text: "LinkedIn and Twitter." },
  { role: "agent", text: "Deploying now.\n\n  Spinning up SCOUT — LinkedIn ICP finder & outreach\n  Spinning up PULSE — Twitter thought leadership\n\n✓  Both agents are live. SCOUT starts with 50 ICP-matched profiles today. PULSE will draft your first thread for approval before posting." },
];

function TaskConvo({ init, agentName }: { init: string | null; agentName?: string | null }) {
  const [lines, setLines]   = useState<ChatLine[]>([{ role: "user", text: init ?? "", id: -1 }]);
  const [typing, setTyping] = useState(false);
  const [step, setStep]     = useState(0);
  const [val, setVal]       = useState("");
  const [wait, setWait]     = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const ref    = useRef<HTMLTextAreaElement | null>(null);
  const displayName = agentName && agentName.trim().length > 0 ? agentName : "ARIA";
  const avatarInitial = displayName.charAt(0).toUpperCase() || "A";
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => {
    if (step >= REPLIES.length || typing || wait) return;
    const item = REPLIES[step];
    if (item.role === "user") { setWait(true); return; }
    const t = setTimeout(() => { setTyping(true); setLines(l => [...l, { ...item, id: step, live: true }]); }, step === 0 ? 400 : 500);
    return () => clearTimeout(t);
  }, [step, typing, wait]);
  const done = () => { setTyping(false); setStep(s => s + 1); };
  const send = () => {
    if (!val.trim()) return;
    setLines(l => [...l, { role: "user", text: val, id: step }]);
    setVal(""); setWait(false); setStep(s => s + 1);
    if (ref.current) ref.current.style.height = "auto";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* messages — centered column matching composer width */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {lines.map(line => (
            <div key={line.id} style={{ animation: "slideUp .2s ease" }}>
              {line.role === "agent" && (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: S.greenLight, border: `1px solid ${S.greenMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S.mono, fontSize: 10, color: S.green }}>{avatarInitial}</div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 6 }}>{displayName}</div>
                    <div style={{ fontSize: 14, color: S.text, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                      {line.live && lines[lines.length - 1]?.id === line.id
                        ? <Typewriter text={line.text} speed={12} onDone={done} />
                        : line.text}
                    </div>
                  </div>
                </div>
              )}
              {line.role === "user" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ background: S.sidebarAct, color: S.text, borderRadius: "16px 16px 4px 16px", padding: "11px 16px", fontSize: 14, lineHeight: 1.6, maxWidth: "75%" }}>
                    {line.text}
                  </div>
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: S.greenLight, border: `1px solid ${S.greenMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S.mono, fontSize: 10, color: S.green }}>{avatarInitial}</div>
              <div style={{ paddingTop: 8, display: "flex", gap: 3 }}>
                {[0,.18,.36].map(d => <span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: S.textDim, display: "inline-block", animation: `dot 1.2s ${d}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer — same width as messages, Claude-style */}
      <div style={{ padding: "12px 24px 20px", flexShrink: 0 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", background: S.surface, border: `1.5px solid ${S.borderMid}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <textarea ref={ref} rows={2} disabled={!wait} value={val}
            onChange={e => { setVal(e.target.value); const el = ref.current; if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; } }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={wait ? "Reply..." : `${displayName} is thinking...`}
            style={{ width: "100%", border: "none", background: "transparent", padding: "14px 18px 6px", fontFamily: S.sans, fontSize: 15, color: S.text, resize: "none", lineHeight: 1.5, minHeight: 52 }}
          />
          <div style={{ padding: "4px 12px 12px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={send} disabled={!wait} style={{ background: wait ? S.text : S.border, color: wait ? "#fff" : S.textDim, border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>↵</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────── */
const W_AGENTS = [
  { name: "SCOUT", role: "LinkedIn Specialist", color: "#2563EB",
    doing: "Scanning for ICP profiles matching 'supply chain director'",
    tasks: [
      { text: "Identified 47 ICP profiles in freight + 3PL verticals", done: true },
      { text: "Sent connection req → Jessica Lim, VP Ops @ FreightCo", done: true },
      { text: "Sent connection req → Marcus Chen, Head of Logistics @ ShipFast", done: true },
      { text: "Running batch outreach — 12 pending replies", done: false, active: true },
      { text: "Qualify warm replies for demo handoff", done: false },
    ] },
  { name: "PULSE", role: "Twitter / X Specialist", color: "#D97706",
    doing: "Drafting thread: '5 signs your freight ops are leaking revenue'",
    tasks: [
      { text: "Published: 'How 3PLs cut dwell time by 40%' — 2.3K impressions", done: true },
      { text: "Engaged 8 replies in logistics conversations", done: true },
      { text: "Scheduled Monday thread on carrier diversification", done: true },
      { text: "Drafting thread on freight visibility for approval", done: false, active: true },
      { text: "Identify top 20 logistics influencers to engage", done: false },
    ] },
];

function Dashboard({ onChat }: { onChat: (agentName: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: S.text }}>Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: S.mono, fontSize: 11, color: S.green }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.green, display: "inline-block", animation: "pulse 2s infinite" }} />
            2 running
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ l: "Working agents", v: "2" }, { l: "Ongoing tasks", v: "2" }, { l: "Completed", v: "6" }].map(s => (
            <div key={s.l} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: S.text }}>{s.v}</div>
              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.textDim, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Morning report */}
        <div style={{ background: S.greenLight, border: `1px solid ${S.greenMid}`, borderRadius: 10, padding: "13px 18px", display: "flex", gap: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: S.surface, border: `1px solid ${S.greenMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S.mono, fontSize: 10, color: S.green, flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: S.green, marginBottom: 3, fontFamily: S.mono }}>MORNING REPORT</div>
            <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.65 }}>SCOUT has 14 warm replies — recommend qualifying top 5 for demo. PULSE's freight thread is at 2.3K impressions. Consider activating FORGE for SEO this week.</div>
          </div>
        </div>

        {/* Agent cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {W_AGENTS.map(ag => (
            <div key={ag.name} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 11 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${S.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: S.mono, fontSize: 13, fontWeight: 500, color: ag.color }}>{ag.name}</div>
                    <div style={{ fontSize: 11, color: S.textDim, marginTop: 2 }}>{ag.role}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <button onClick={() => onChat(ag.name)} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 6, padding: "3px 9px", fontSize: 11, color: S.textMid, fontFamily: S.mono }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = ag.color; e.currentTarget.style.color = ag.color; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMid; }}>
                      chat
                    </button>
                    <span style={{ fontFamily: S.mono, fontSize: 10, padding: "2px 8px", borderRadius: 100, background: S.greenLight, color: S.green, display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: S.green, display: "inline-block", animation: "pulse 1.4s infinite" }} />running
                    </span>
                  </div>
                </div>
                <div style={{ background: `${ag.color}09`, border: `1px solid ${ag.color}18`, borderRadius: 6, padding: "6px 10px", fontFamily: S.mono, fontSize: 11, color: ag.color }}>
                  <span style={{ opacity: .5 }}>now: </span>{ag.doing}
                </div>
              </div>
              <div style={{ padding: "12px 18px" }}>
                <div style={{ fontFamily: S.mono, fontSize: 10, color: S.textDim, letterSpacing: .8, marginBottom: 10 }}>TASKS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ag.tasks.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, marginTop: 3, width: 10 }}>
                        {t.done ? <span style={{ fontSize: 10, color: S.green }}>✓</span>
                          : t.active ? <span style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${ag.color}`, display: "inline-block", animation: "pulse 1.2s infinite" }} />
                          : <span style={{ width: 8, height: 8, borderRadius: 2, border: `1px solid ${S.border}`, display: "inline-block" }} />}
                      </div>
                      <span style={{ fontSize: 12, lineHeight: 1.5, color: t.done ? S.textDim : t.active ? S.text : S.textDim, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Agents Page ─────────────────────────────────────────── */
const AGENTS = [
  { name: "SCOUT", tagline: "LinkedIn prospecting & ICP outreach", color: "#2563EB", status: "hired", desc: "Finds ICP-matched profiles on LinkedIn and runs personalized connection + follow-up sequences.", caps: ["ICP matching","Connection sequencing","Reply detection","Lead qualification"] },
  { name: "PULSE", tagline: "Twitter / X thought leadership",       color: "#D97706", status: "hired", desc: "Builds your brand voice on Twitter — writes threads, joins conversations, grows your audience.", caps: ["Thread writing","Trend monitoring","Engagement replies","Audience building"] },
  { name: "FORGE", tagline: "SEO content & blog pipeline",          color: "#7C3AED", status: "available", desc: "Researches keywords, writes SEO-optimized blog posts, keeps your content calendar on schedule.", caps: ["Keyword research","Blog writing","On-page SEO","Content calendar"] },
  { name: "HERALD",tagline: "Email newsletter & nurture",           color: "#0891B2", status: "available", desc: "Writes and sends your newsletter, builds drip sequences, tracks performance.", caps: ["Newsletter writing","Drip sequences","A/B testing","Segment targeting"] },
  { name: "LENS",  tagline: "Competitor & market intelligence",     color: "#BE185D", status: "available", desc: "Monitors competitor moves, tracks pricing, surfaces market signals for your positioning.", caps: ["Competitor monitoring","Pricing tracking","Share of voice","Weekly intel"] },
  { name: "SPARK", tagline: "Paid ads strategy & copy",             color: "#DC2626", status: "coming",   desc: "Plans and writes copy for Google and LinkedIn ads, monitors spend efficiency.", caps: ["Ad copywriting","Audience targeting","Budget planning","Performance analysis"] },
];

/* ── Missions Page ───────────────────────────────────────── */
function MissionsPage({ onChat, onHire }: { onChat: (agentName: string) => void; onHire: () => void }) {
  const STATS: Stat[] = [
    { label: "Agents active",     v: "2",   sub: "of 2 hired" },
    { label: "Tasks in progress", v: "2",   sub: "this week" },
    { label: "Completed",         v: "6",   sub: "all time" },
    { label: "Leads identified",  v: "47",  sub: "by SCOUT" },
    { label: "Impressions",       v: "2.3K",sub: "via PULSE" },
    { label: "Warm replies",      v: "14",  sub: "awaiting action" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: S.text }}>Missions</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: S.mono, fontSize: 11, color: S.green }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.green, display: "inline-block", animation: "pulse 2s infinite" }} />
            2 agents running
          </div>
        </div>

        {/* ── Section: Briefing */}
        <div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.textDim, letterSpacing: 1, marginBottom: 12 }}>BRIEFING</div>

          {/* ARIA report — concise, structured */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: S.greenLight, border: `1px solid ${S.greenMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S.mono, fontSize: 10, color: S.green, flexShrink: 0, marginTop: 1 }}>A</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: S.text }}>ARIA</span>
                <span style={{ fontFamily: S.mono, fontSize: 10, color: S.textDim }}>· today 08:00</span>
              </div>

              {/* Bullet briefing */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { tag: "ACTION",  color: "#D97706", bg: "#FFFBEB", text: "14 warm LinkedIn replies — qualify top 5 for demo this week." },
                  { tag: "WINNING", color: S.green,   bg: S.greenLight, text: "PULSE's freight visibility thread: 2.3K impressions, best performing content to date." },
                  { tag: "SUGGEST", color: "#6B6760", bg: S.mainBg, text: "Inbound channel still untapped. Recommend hiring an SEO agent." },
                ].map(item => (
                  <div key={item.tag} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: S.mono, fontSize: 9, padding: "2px 6px", borderRadius: 3, background: item.bg, color: item.color, border: `1px solid ${item.color}30`, flexShrink: 0, marginTop: 2, letterSpacing: .5 }}>{item.tag}</span>
                    <span style={{ fontSize: 13, color: S.text, lineHeight: 1.6 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Snapshot — replaces the stat cards */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${S.border}` }}>
                <div style={{ fontFamily: S.mono, fontSize: 10, color: S.textDim, letterSpacing: .8, marginBottom: 8 }}>SNAPSHOT</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {STATS.map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "6px 10px", borderRadius: 999, border: `1px solid ${S.border}`, background: S.mainBg }}>
                      <span style={{ fontFamily: S.mono, fontSize: 11, color: S.text, fontWeight: 600 }}>{s.v}</span>
                      <span style={{ fontSize: 11, color: S.textMid }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: S.textDim, opacity: .75 }}>· {s.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={onHire} style={{ marginTop: 14, background: "none", border: `1px solid ${S.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, color: S.textMid, cursor: "pointer", transition: "all .12s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.green; e.currentTarget.style.color = S.green; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMid; }}>
                + Hire an SEO agent →
              </button>
            </div>
          </div>
        </div>

        {/* ── Section: Working Agents */}
        <div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.textDim, letterSpacing: 1, marginBottom: 12 }}>WORKING AGENTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {W_AGENTS.map(ag => (
              <div key={ag.name} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 11 }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${S.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 13, fontWeight: 500, color: ag.color }}>{ag.name}</div>
                      <div style={{ fontSize: 11, color: S.textDim, marginTop: 2 }}>{ag.role}</div>
                    </div>
                    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                      <button onClick={() => onChat(ag.name)} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 6, padding: "3px 9px", fontSize: 11, color: S.textMid, fontFamily: S.mono, cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = ag.color; e.currentTarget.style.color = ag.color; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMid; }}>chat</button>
                      <span style={{ fontFamily: S.mono, fontSize: 10, padding: "2px 8px", borderRadius: 100, background: S.greenLight, color: S.green, display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: S.green, display: "inline-block", animation: "pulse 1.4s infinite" }} />running
                      </span>
                    </div>
                  </div>
                  <div style={{ background: `${ag.color}09`, border: `1px solid ${ag.color}18`, borderRadius: 6, padding: "6px 10px", fontFamily: S.mono, fontSize: 11, color: ag.color }}>
                    <span style={{ opacity: .5 }}>now: </span>{ag.doing}
                  </div>
                </div>
                <div style={{ padding: "12px 18px" }}>
                  <div style={{ fontFamily: S.mono, fontSize: 10, color: S.textDim, letterSpacing: .8, marginBottom: 10 }}>TASKS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {ag.tasks.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0, marginTop: 3, width: 10 }}>
                          {t.done ? <span style={{ fontSize: 10, color: S.green }}>✓</span>
                            : t.active ? <span style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${ag.color}`, display: "inline-block", animation: "pulse 1.2s infinite" }} />
                            : <span style={{ width: 8, height: 8, borderRadius: 2, border: `1px solid ${S.border}`, display: "inline-block" }} />}
                        </div>
                        <span style={{ fontSize: 12, lineHeight: 1.5, color: t.done ? S.textDim : t.active ? S.text : S.textDim, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Agents Page ─────────────────────────────────────────── */
function AgentsPage({ onChat }: { onChat: (agentName: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: S.text, marginBottom: 4 }}>Agents</h1>
        <p style={{ fontSize: 13, color: S.textMid, marginBottom: 22 }}>Hire specialist agents. ARIA coordinates them automatically.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {AGENTS.map(ag => (
            <div key={ag.name} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 11, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: S.mono, fontSize: 13, fontWeight: 500, color: ag.color, marginBottom: 2 }}>{ag.name}</div>
                  <div style={{ fontSize: 11, color: S.textMid }}>{ag.tagline}</div>
                </div>
                {ag.status === "hired"  && <span style={{ fontFamily: S.mono, fontSize: 10, padding: "2px 7px", borderRadius: 100, background: S.greenLight, color: S.green }}>hired</span>}
                {ag.status === "coming" && <span style={{ fontFamily: S.mono, fontSize: 10, padding: "2px 7px", borderRadius: 100, border: `1px solid ${S.border}`, color: S.textDim }}>soon</span>}
              </div>
              <p style={{ fontSize: 12, color: S.textMid, lineHeight: 1.6, marginBottom: 12 }}>{ag.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                {ag.caps.map(c => <span key={c} style={{ padding: "2px 8px", borderRadius: 100, border: `1px solid ${S.border}`, fontSize: 11, color: S.textDim, background: S.mainBg }}>{c}</span>)}
              </div>
              {ag.status === "hired" && (
                <button onClick={() => onChat(ag.name)} style={{ width: "100%", padding: "7px", borderRadius: 8, background: "none", border: `1px solid ${S.border}`, fontSize: 12, color: S.textMid, cursor: "pointer", transition: "all .12s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ag.color; e.currentTarget.style.color = ag.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMid; }}>chat</button>
              )}
              {ag.status === "available" && (
                <button onClick={() => onChat(ag.name)} style={{ width: "100%", padding: "7px", borderRadius: 8, background: "none", border: `1px solid ${S.border}`, fontSize: 12, color: S.textMid, cursor: "pointer", transition: "all .12s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ag.color; e.currentTarget.style.color = ag.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMid; }}>hire</button>
              )}
              {ag.status === "coming" && (
                <div style={{ padding: "7px", borderRadius: 8, background: S.mainBg, fontSize: 11, color: S.textDim, textAlign: "center", fontFamily: S.mono }}>coming soon</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── App Shell ───────────────────────────────────────────── */
const HIST_DEFAULT: HistoryItem[] = [
  { id: 1, label: "LinkedIn ICP outreach campaign" },
  { id: 2, label: "Twitter content strategy" },
  { id: 3, label: "Define ICP segments" },
];

function SidebarBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon?: ReactNode; children: ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "7px 14px", border: "none", textAlign: "left",
        borderRadius: 7, margin: "1px 6px", width: "calc(100% - 12px)",
        background: active ? S.sidebarAct : hov ? S.sidebarHov : "transparent",
        color: S.sidebarText,
        fontSize: 13, cursor: "pointer", transition: "background .1s",
      }}>
      {icon && <span style={{ fontSize: 14, opacity: .7, width: 18, textAlign: "center" }}>{icon}</span>}
      <span style={{ opacity: active ? 1 : .85 }}>{children}</span>
    </button>
  );
}

function AppShell({ onBack }: { onBack: () => void }) {
  const [tab, setTab]   = useState<"home" | "missions" | "agents" | "task">("home");
  const [task, setTask] = useState<string | null>(null);
  const [hist, setHist] = useState<HistoryItem[]>(HIST_DEFAULT);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const startTask = (msg: string, agentName?: string | null) => {
    const short = msg.slice(0, 42) + (msg.length > 42 ? "…" : "");
    setHist(h => [{ id: Date.now(), label: short }, ...h]);
    setTask(msg);
    setActiveAgent(agentName ?? "ARIA");
    setTab("task");
  };
  const chatAgent = (name: string) => startTask(`I want to work directly with ${name}`, name);

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden" }}>

      {/* ── Sidebar (dark, Claude-style) */}
      <div style={{ width: 220, background: S.sidebarBg, borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", flexShrink: 0, padding: "10px 0 16px" }}>

        {/* Logo */}
        <div style={{ padding: "8px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: S.mono, fontSize: 14, fontWeight: 500, color: S.text }}>getu<span style={{ color: S.green }}>.ai</span></span>
          <button onClick={onBack} title="collapse sidebar" style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", alignItems: "center", opacity: .5 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="1.5" rx=".75" fill={S.sidebarText}/>
              <rect x="1" y="7.25" width="9" height="1.5" rx=".75" fill={S.sidebarText}/>
              <rect x="1" y="11.5" width="14" height="1.5" rx=".75" fill={S.sidebarText}/>
            </svg>
          </button>
        </div>

        {/* New task + nav */}
        <SidebarBtn active={tab === "home"} onClick={() => { setTab("home"); setTask(null); }} icon="＋">New task</SidebarBtn>
        <SidebarBtn active={tab === "missions"} onClick={() => setTab("missions")} icon="◎">Missions</SidebarBtn>
        <SidebarBtn active={tab === "agents"} onClick={() => setTab("agents")} icon="⬡">Agents</SidebarBtn>

        {/* Recents */}
        <div style={{ margin: "16px 20px 6px", fontSize: 11, color: S.sidebarDim, letterSpacing: .5, fontFamily: S.mono }}>Recents</div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {hist.map(h => {
            const isAct = tab === "task" && task?.startsWith(h.label.replace("…",""));
            return (
              <button key={h.id} onClick={() => { setTask(h.label); setTab("task"); }}
                style={{
                  display: "block", width: "calc(100% - 12px)", margin: "1px 6px", textAlign: "left",
                  padding: "6px 14px", background: isAct ? S.sidebarAct : "transparent", border: "none",
                  borderRadius: 7, color: isAct ? "#e8e4de" : S.sidebarDim,
                  fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis", transition: "background .1s",
                }}
                onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = S.sidebarHov; e.currentTarget.style.color = S.sidebarText; }}
                onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isAct ? "#e8e4de" : S.sidebarDim; }}
              >{h.label}</button>
            );
          })}
        </div>

        {/* User */}
        <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0ddd6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: S.text, fontWeight: 500, flexShrink: 0 }}>J</div>
          <div>
            <div style={{ fontSize: 12, color: S.text, fontWeight: 500 }}>Jordan</div>
            <div style={{ fontSize: 11, color: S.textDim }}>Free plan</div>
          </div>
        </div>
      </div>

      {/* ── Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: S.mainBg }}>
        {tab === "home"      && <AppHome onStart={(msg) => startTask(msg, "ARIA")} />}
        {tab === "task"      && <TaskConvo init={task} agentName={activeAgent} />}
        {tab === "missions"  && <MissionsPage onChat={chatAgent} onHire={() => setTab("agents")} />}
        {tab === "agents"    && <AgentsPage onChat={chatAgent} />}
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("landing");
  return (
    <>
      <style>{STYLE}</style>
      {view === "landing" && <LandingPage onEnter={() => setView("app")} />}
      {view === "app"     && <AppShell onBack={() => setView("landing")} />}
    </>
  );
}