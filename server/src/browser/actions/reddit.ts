import type { Page } from "playwright";
import { navigate } from "../index.js";
import type { SignalPost } from "../../../../shared/types.js";

// Reddit browser actions used by SCOUT agent (read-only).

// Search Reddit for posts expressing a given pain or topic.
export async function searchRedditPosts(
  page: Page,
  query: string,
  limit = 20
): Promise<Omit<SignalPost, "relevanceScore" | "relevanceExplanation" | "suggestedReplyAngle">[]> {
  const encoded = encodeURIComponent(query);
  await navigate(page, `https://www.reddit.com/search/?q=${encoded}&sort=new&t=month`);

  // Reddit's search results use shreddit-post web components on the new Reddit UI
  await page.waitForSelector("shreddit-post, .Post", { timeout: 15_000 }).catch(() => null);

  const posts = await page.$$eval(
    "shreddit-post, .Post",
    (nodes, maxItems) =>
      nodes.slice(0, maxItems).map((node) => {
        // New Reddit UI (shreddit-post attributes)
        const title      = node.getAttribute("post-title") ?? node.querySelector("h3")?.textContent?.trim() ?? "";
        const author     = node.getAttribute("author") ?? "unknown";
        const subreddit  = node.getAttribute("subreddit-prefixed-name") ?? "";
        const permalink  = node.getAttribute("permalink") ?? "";
        const createdAt  = node.getAttribute("created-timestamp") ?? new Date().toISOString();

        return {
          url:          permalink.startsWith("http") ? permalink : `https://www.reddit.com${permalink}`,
          platform:     "reddit" as const,
          author,
          authorHandle: `u/${author}`,
          content:      `[${subreddit}] ${title}`,
          postedAt:     createdAt,
        };
      }),
    limit
  );

  return posts.filter((p) => p.content.length > 3);
}
