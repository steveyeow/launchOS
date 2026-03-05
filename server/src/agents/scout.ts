import { tool } from "ai";
import { z } from "zod";
import { BaseAgent, type AgentRunInput, type AgentRunResult } from "./base.js";
import { createSession } from "../browser/index.js";
import { searchTwitterPosts, searchTwitterProfiles } from "../browser/actions/twitter.js";
import { searchRedditPosts } from "../browser/actions/reddit.js";
import { searchLinkedInProfiles } from "../browser/actions/linkedin.js";
import { deepseek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { z as zod } from "zod";
import type { SignalPost, IcpProfile, TaskResultData } from "../../../shared/types.js";

export class ScoutAgent extends BaseAgent {
  name = "SCOUT" as const;

  systemPrompt = `You are SCOUT, a specialist GTM agent focused on finding signals and people.

Your job:
1. Find posts on Twitter/X and Reddit where people express the pain that the user's product solves.
2. Find people on Twitter/X and LinkedIn who match the user's ICP.
3. Generate personalized outreach drafts for the best matches.

Always be specific. Use targeted search queries based on the actual pain points and ICP.
Think like a smart SDR: what would a potential customer complain about publicly?
What words would they use? What subreddits would they post in?

After gathering results, score each item for relevance and explain WHY it's a match.`;

  tools = {
    search_signal_posts: tool({
      description: "Search Twitter/X and Reddit for posts where people express pain that the product solves",
      parameters: z.object({
        query:    z.string().describe("Search query — use natural language the ICP would use when venting about their problem"),
        platform: z.enum(["twitter", "reddit", "both"]).default("both"),
        limit:    z.number().int().min(5).max(30).default(20),
      }),
      execute: async ({ query, platform, limit }) => {
        const results: Omit<SignalPost, "relevanceScore" | "relevanceExplanation" | "suggestedReplyAngle">[] = [];

        const session = await createSession();
        try {
          if (platform === "twitter" || platform === "both") {
            const tweets = await searchTwitterPosts(session.page, query, limit);
            results.push(...tweets);
          }
          if (platform === "reddit" || platform === "both") {
            const posts = await searchRedditPosts(session.page, query, Math.ceil(limit / 2));
            results.push(...posts);
          }
        } finally {
          await session.close();
        }

        return { posts: results, count: results.length };
      },
    }),

    search_icp_people: tool({
      description: "Find people on Twitter/X and LinkedIn who match the ICP definition",
      parameters: z.object({
        query:    z.string().describe("Search query — job title + industry keywords, e.g. 'head of logistics freight 3PL'"),
        platform: z.enum(["twitter", "linkedin", "both"]).default("both"),
        limit:    z.number().int().min(5).max(20).default(15),
      }),
      execute: async ({ query, platform, limit }) => {
        const results: Omit<IcpProfile, "matchExplanation" | "suggestedOutreach">[] = [];

        const session = await createSession();
        try {
          if (platform === "twitter" || platform === "both") {
            const profiles = await searchTwitterProfiles(session.page, query, limit);
            results.push(...profiles);
          }
          if (platform === "linkedin" || platform === "both") {
            const profiles = await searchLinkedInProfiles(session.page, query, limit);
            results.push(...profiles);
          }
        } finally {
          await session.close();
        }

        return { profiles: results, count: results.length };
      },
    }),
  };

  protected async execute(input: AgentRunInput): Promise<AgentRunResult> {
    const { goal, productProfile } = input;

    // Step 1: Run the agentic loop — SCOUT decides what to search for
    const { text: rawFindings } = await this.runAgenticLoop([
      {
        role: "user",
        content: `
Product value prop: ${productProfile.valueProp}
ICP: ${productProfile.icpSummary}
ICP titles: ${productProfile.icpTitles.join(", ")}
ICP industries: ${productProfile.icpIndustries.join(", ")}
Pain points: ${productProfile.painPoints.join("; ")}

Task: ${goal}

Use your tools to find signal posts and/or ICP-matching people.
Run 2-3 targeted searches with different query angles.
Return a summary of what you found.
`,
      },
    ]);

    // Step 2: Use a fast model to score and structure the findings
    const { object: structured } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: zod.object({
        type:    zod.enum(["signal_posts", "icp_profiles"]),
        summary: zod.string(),
        posts: zod.array(zod.object({
          url:                    zod.string(),
          platform:               zod.enum(["twitter", "reddit"]),
          author:                 zod.string(),
          authorHandle:           zod.string(),
          content:                zod.string(),
          postedAt:               zod.string(),
          relevanceScore:         zod.number().min(0).max(1),
          relevanceExplanation:   zod.string(),
          suggestedReplyAngle:    zod.string(),
        })).optional().default([]),
        profiles: zod.array(zod.object({
          name:               zod.string(),
          handle:             zod.string(),
          platform:           zod.enum(["twitter", "linkedin"]),
          profileUrl:         zod.string(),
          headline:           zod.string(),
          company:            zod.string().nullable(),
          matchExplanation:   zod.string(),
          suggestedOutreach:  zod.string().nullable(),
        })).optional().default([]),
      }),
      prompt: `
Based on the scout findings below, structure the results and score each item for relevance.

Product pain points: ${productProfile.painPoints.join("; ")}
ICP: ${productProfile.icpSummary}

Scout findings:
${rawFindings}

Score relevance 0-1. Explain WHY each item is relevant. Suggest reply angle or outreach message.
`,
    });

    const resultData: TaskResultData =
      structured.type === "signal_posts"
        ? { type: "signal_posts", posts: structured.posts as SignalPost[] }
        : { type: "icp_profiles", profiles: structured.profiles as IcpProfile[] };

    return {
      summary: structured.summary,
      data:    resultData,
    };
  }
}

export const scout = new ScoutAgent();
