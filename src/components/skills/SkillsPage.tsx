import { useState } from "react";
import { T } from "../../lib/theme.js";

// Mirrors server/src/skills/index.ts — kept in sync manually
const AGENT_COLOR: Record<string, string> = {
  GEO:       "#0891B2",
  SCOUT:     "#2563EB",
  PULSE:     "#D97706",
  FORGE:     "#7C3AED",
  HERALD:    "#BE185D",
  COMMUNITY: "#059669",
};

interface Skill {
  id:          string;
  name:        string;
  agent:       string;
  phase:       1 | 2;
  description: string;
  inputs:      string[];
  outputs:     string[];
  example:     string;
}

const SKILLS: Skill[] = [
  // ── GEO ────────────────────────────────────────────────────────────────────
  {
    id:          "check_geo_status",
    name:        "Check GEO status",
    agent:       "GEO",
    phase:       1,
    description: "Audit any website URL for Generative Engine Optimization (GEO) status. Checks AI bot access, llms.txt, structured data, metadata, and content quality. Returns a 0–100 score with grade and prioritized fixes.",
    inputs:      ["Website URL to audit"],
    outputs:     ["Score (0–100) + grade", "Per-check results with pass/fail/warn", "Top 5 priority fixes", "Live AI visibility test prompts for ChatGPT, Perplexity, Claude"],
    example:     "Check the GEO status of https://acme.com — are we visible to ChatGPT and Perplexity?",
  },

  // ── SCOUT ──────────────────────────────────────────────────────────────────
  {
    id:          "find_signal_posts",
    name:        "Find signal posts",
    agent:       "SCOUT",
    phase:       1,
    description: "Search Twitter/X and Reddit for posts where people publicly express the pain point your product solves. Great for warm prospects and understanding how your ICP talks about their problems.",
    inputs:      ["Pain point keywords", "Product category", "Target platforms (Twitter, Reddit, or both)"],
    outputs:     ["Posts with author, content, engagement metrics, and relevance score"],
    example:     "Find founders and ops managers on Twitter complaining about manual lead research.",
  },
  {
    id:          "find_icp_people",
    name:        "Find ICP-matching people",
    agent:       "SCOUT",
    phase:       1,
    description: "Search Twitter/X and LinkedIn for people who match your ideal customer profile by job title, industry, and company size.",
    inputs:      ["Target job titles", "Industries", "Company size range", "Geography (optional)", "Platforms"],
    outputs:     ["Profiles with name, title, company, platform link, and match score"],
    example:     "Find VP of Sales at B2B SaaS companies with 50–500 employees in the US.",
  },
  {
    id:          "generate_outreach_drafts",
    name:        "Generate outreach drafts",
    agent:       "SCOUT",
    phase:       1,
    description: "For ICP-matching profiles or signal post authors, generate personalized outreach that references their specific context. Requires human review before sending.",
    inputs:      ["Target profiles or posts", "Outreach angle", "Tone (warm / direct / formal)"],
    outputs:     ["Personalized message drafts ready for human review"],
    example:     "Draft LinkedIn messages for 10 VP Sales profiles referencing their outbound challenge.",
  },

  // ── PULSE ──────────────────────────────────────────────────────────────────
  {
    id:          "post_twitter_content",
    name:        "Post Twitter/X content",
    agent:       "PULSE",
    phase:       2,
    description: "Create and publish tweets or threads — immediately or scheduled. Requires a connected Twitter account.",
    inputs:      ["Topic or angle", "Format (tweet or thread)", "Tone", "Schedule"],
    outputs:     ["Published tweet/thread with link"],
    example:     "Post a thread on the 3 biggest outbound mistakes founders make.",
  },
  {
    id:          "reply_to_signal_posts",
    name:        "Reply to signal posts",
    agent:       "PULSE",
    phase:       2,
    description: "Post helpful, non-spammy replies to signal posts. Human approval required before each reply goes live.",
    inputs:      ["Signal posts to reply to", "Reply angle", "Brand voice"],
    outputs:     ["Draft replies → published after your approval"],
    example:     "Reply to the 5 highest-engagement signal posts with a helpful take.",
  },

  // ── FORGE ──────────────────────────────────────────────────────────────────
  {
    id:          "write_seo_article",
    name:        "Write SEO blog article",
    agent:       "FORGE",
    phase:       2,
    description: "Research and write a long-form SEO article for a target keyword. Includes outline, full draft, and meta description.",
    inputs:      ["Target keyword", "Article angle", "Word count", "Target audience"],
    outputs:     ["Full article draft with title, meta description, and suggested slug"],
    example:     "Write 1,500 words targeting 'B2B lead generation for SaaS startups'.",
  },
];

export default function SkillsPage({ onChat }: { onChat: (prompt?: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const phase1 = SKILLS.filter(s => s.phase === 1);
  const phase2 = SKILLS.filter(s => s.phase === 2);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 6 }}>Skills</h1>
          <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>
            Each skill is a capability ARIA can activate on your behalf. Tell ARIA what you need — it will pick the right skill and agent automatically.
          </p>
        </div>

        {/* Phase 1 */}
        <SectionLabel label="Available now" dot={T.green} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {phase1.map(skill => (
            <SkillCard key={skill.id} skill={skill} expanded={expanded === skill.id} onToggle={() => setExpanded(expanded === skill.id ? null : skill.id)} onChat={() => onChat(skill.example)} />
          ))}
        </div>

        {/* Phase 2 */}
        <SectionLabel label="Coming soon" dot={T.textDim} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.6 }}>
          {phase2.map(skill => (
            <SkillCard key={skill.id} skill={skill} expanded={expanded === skill.id} onToggle={() => setExpanded(expanded === skill.id ? null : skill.id)} onChat={onChat} soon />
          ))}
        </div>

      </div>
    </div>
  );
}

function SectionLabel({ label, dot }: { label: string; dot: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
      <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textDim, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function SkillCard({ skill, expanded, onToggle, onChat, soon }: { skill: Skill; expanded: boolean; onToggle: () => void; onChat: () => void; soon?: boolean  }) {
  const color = AGENT_COLOR[skill.agent] ?? T.textMid;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div onClick={soon ? undefined : onToggle} style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", cursor: soon ? "default" : "pointer" }}>
        {/* Agent badge */}
        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 9, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color }}>{skill.agent.slice(0, 3)}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{skill.name}</span>
            <span style={{ fontSize: 10, fontFamily: T.mono, color, background: `${color}10`, borderRadius: 100, padding: "1px 7px" }}>{skill.agent}</span>
          </div>
          <p style={{ fontSize: 12, color: T.textMid, lineHeight: 1.55, margin: 0 }}>{skill.description}</p>
        </div>

        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {soon && <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim, border: `1px solid ${T.border}`, borderRadius: 100, padding: "2px 8px" }}>soon</span>}
          {!soon && <ChevronIcon rotated={expanded} />}
        </div>
      </div>

      {expanded && !soon && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim, marginBottom: 5, letterSpacing: 0.4 }}>INPUTS</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 3 }}>
                {skill.inputs.map((inp, i) => (
                  <li key={i} style={{ fontSize: 12, color: T.textMid, lineHeight: 1.5 }}>{inp}</li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim, marginBottom: 5, letterSpacing: 0.4 }}>OUTPUTS</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 3 }}>
                {skill.outputs.map((out, i) => (
                  <li key={i} style={{ fontSize: 12, color: T.textMid, lineHeight: 1.5 }}>{out}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ background: T.bg, borderRadius: 7, padding: "9px 12px" }}>
            <div style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim, marginBottom: 4, letterSpacing: 0.4 }}>EXAMPLE</div>
            <p style={{ fontSize: 12, color: T.textMid, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>"{skill.example}"</p>
          </div>

          <button
            onClick={onChat}
            style={{ alignSelf: "flex-start", background: T.text, color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
          >
            Ask ARIA to run this →
          </button>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: rotated ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
      <path d="M3 5l4 4 4-4" stroke={T.textDim} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
