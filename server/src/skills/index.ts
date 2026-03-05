// Skills catalog — defines what each specialist agent can do.
// ARIA uses this to know which agent to dispatch and what context to provide.

export interface Skill {
  id:          string;
  name:        string;
  agent:       string;
  phase:       1 | 2;
  description: string;
  inputs:      string[];    // What information the agent needs to execute this skill
  outputs:     string[];    // What it produces
  example:     string;      // Example task goal
}

export const SKILLS: Skill[] = [
  // ── GEO ────────────────────────────────────────────────────────────────────
  {
    id:          "check_geo_status",
    name:        "Check GEO status",
    agent:       "GEO",
    phase:       1,
    description: "Audit any website URL for Generative Engine Optimization (GEO) status. Checks AI bot access, llms.txt, structured data, metadata, content quality, and produces a 0–100 score with grade and prioritized fixes.",
    inputs:      ["Website URL to audit"],
    outputs:     ["Full GEO report with score, grade, per-check results, top 5 priority fixes, and live AI visibility test prompts"],
    example:     "Check the GEO status of https://acme.com — are we visible to ChatGPT, Perplexity, and Claude?",
  },

  // ── SCOUT ──────────────────────────────────────────────────────────────────
  {
    id:          "find_signal_posts",
    name:        "Find signal posts",
    agent:       "SCOUT",
    phase:       1,
    description: "Search Twitter/X and Reddit for posts where people publicly express the pain point your product solves. Great for finding warm prospects and understanding how your ICP talks about their problems.",
    inputs:      ["Pain point keywords", "Product category", "Target platforms (Twitter, Reddit, or both)"],
    outputs:     ["List of posts with author, content, engagement metrics, and relevance score"],
    example:     "Search Twitter and Reddit for founders and ops managers complaining about manual lead research or outbound prospecting.",
  },
  {
    id:          "find_icp_people",
    name:        "Find ICP-matching people",
    agent:       "SCOUT",
    phase:       1,
    description: "Search Twitter/X and LinkedIn for people who match your ideal customer profile based on job title, industry, and company size. Returns profiles with context about their role and recent activity.",
    inputs:      ["Target job titles", "Industries", "Company size range", "Geography (optional)", "Target platforms"],
    outputs:     ["List of profiles with name, title, company, platform link, and match score"],
    example:     "Find VP of Sales and Head of Revenue at B2B SaaS companies with 50-500 employees in the US.",
  },
  {
    id:          "generate_outreach_drafts",
    name:        "Generate personalized outreach drafts",
    agent:       "SCOUT",
    phase:       1,
    description: "For a list of ICP-matching profiles or signal post authors, generate personalized outreach messages that reference their specific pain or context. Requires human review before sending.",
    inputs:      ["List of target profiles or posts", "Outreach angle (pain-led, value-led, or mutual connection)", "Tone (warm, direct, or formal)"],
    outputs:     ["Personalized message drafts for each target, ready for human review"],
    example:     "Draft personalized LinkedIn messages for the 10 VP Sales profiles found, referencing their company's specific challenge with manual outbound.",
  },

  // ── PULSE (Phase 2) ────────────────────────────────────────────────────────
  {
    id:          "post_twitter_content",
    name:        "Post Twitter/X content",
    agent:       "PULSE",
    phase:       2,
    description: "Create and publish original tweets or threads. Can publish immediately or schedule. Requires connected Twitter account.",
    inputs:      ["Content topic or angle", "Format (single tweet or thread)", "Tone", "Schedule (immediate or specific time)"],
    outputs:     ["Published tweet/thread with link"],
    example:     "Post a thread about the 3 biggest mistakes founders make with outbound, positioning the product as the solution.",
  },
  {
    id:          "reply_to_signal_posts",
    name:        "Reply to signal posts",
    agent:       "PULSE",
    phase:       2,
    description: "Engage with signal posts by posting a helpful, non-spammy reply. Adds value to the conversation while building brand awareness. Requires human approval for each reply before posting.",
    inputs:      ["Signal posts to reply to", "Reply angle (helpful, curious, or expertise-sharing)", "Brand voice guidelines"],
    outputs:     ["Draft replies for human approval, then published after confirmation"],
    example:     "Reply to the 5 highest-engagement signal posts with a genuinely helpful take that naturally references the product.",
  },

  // ── FORGE (Phase 2) ────────────────────────────────────────────────────────
  {
    id:          "write_seo_article",
    name:        "Write SEO blog article",
    agent:       "FORGE",
    phase:       2,
    description: "Research and write a long-form SEO article targeting a specific keyword. Includes outline, full draft, and meta description.",
    inputs:      ["Target keyword", "Article angle", "Word count", "Target audience"],
    outputs:     ["Full article draft with title, meta description, and recommended slug"],
    example:     "Write a 1,500-word article targeting 'B2B lead generation for SaaS startups'.",
  },
];

// Formatted for injection into ARIA's system prompt
export function skillsPromptBlock(): string {
  const phase1 = SKILLS.filter(s => s.phase === 1);
  const phase2 = SKILLS.filter(s => s.phase === 2);

  function formatSkill(s: Skill): string {
    return [
      `  • ${s.name} [${s.agent}]`,
      `    ${s.description}`,
      `    Needs: ${s.inputs.join(", ")}`,
      `    Produces: ${s.outputs.join(", ")}`,
    ].join("\n");
  }

  return [
    "Available skills (Phase 1 — live now):",
    phase1.map(formatSkill).join("\n"),
    "",
    "Coming soon (Phase 2):",
    phase2.map(formatSkill).join("\n"),
  ].join("\n");
}
