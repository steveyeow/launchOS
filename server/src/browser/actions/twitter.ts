import type { Page } from "playwright";
import { navigate } from "../index.js";
import type { SignalPost, IcpProfile } from "../../../../shared/types.js";

// Twitter/X browser actions used by SCOUT agent.
// All read actions work without credentials.
// Write actions (post_reply) require a session with auth cookies.

// Search Twitter for posts matching a query. Returns up to `limit` results.
export async function searchTwitterPosts(
  page: Page,
  query: string,
  limit = 20
): Promise<Omit<SignalPost, "relevanceScore" | "relevanceExplanation" | "suggestedReplyAngle">[]> {
  const encoded = encodeURIComponent(query);
  await navigate(page, `https://twitter.com/search?q=${encoded}&src=typed_query&f=live`);

  // Wait for tweets to load
  await page.waitForSelector('[data-testid="tweet"]', { timeout: 15_000 }).catch(() => null);

  const tweets = await page.$$eval(
    '[data-testid="tweet"]',
    (nodes, maxItems) =>
      nodes.slice(0, maxItems).map((node) => {
        const textEl    = node.querySelector('[data-testid="tweetText"]');
        const userEl    = node.querySelector('[data-testid="User-Name"]');
        const timeEl    = node.querySelector("time");
        const linkEl    = node.querySelector('a[href*="/status/"]');

        const content     = textEl?.textContent?.trim() ?? "";
        const authorLine  = userEl?.textContent?.trim() ?? "";
        const postedAt    = timeEl?.getAttribute("datetime") ?? new Date().toISOString();
        const href        = linkEl?.getAttribute("href") ?? "";

        // authorLine is typically "Display Name @handle" — split on last @
        const atIndex    = authorLine.lastIndexOf("@");
        const author     = atIndex > 0 ? authorLine.slice(0, atIndex).trim() : authorLine;
        const handle     = atIndex > 0 ? authorLine.slice(atIndex) : "";

        return {
          url:          `https://twitter.com${href}`,
          platform:     "twitter" as const,
          author,
          authorHandle: handle,
          content,
          postedAt,
        };
      }),
    limit
  );

  return tweets.filter((t) => t.content.length > 0);
}

// Search Twitter for user profiles matching an ICP query
export async function searchTwitterProfiles(
  page: Page,
  query: string,
  limit = 15
): Promise<Omit<IcpProfile, "matchExplanation" | "suggestedOutreach">[]> {
  const encoded = encodeURIComponent(query);
  await navigate(page, `https://twitter.com/search?q=${encoded}&src=typed_query&f=user`);

  await page.waitForSelector('[data-testid="UserCell"]', { timeout: 15_000 }).catch(() => null);

  const profiles = await page.$$eval(
    '[data-testid="UserCell"]',
    (nodes, maxItems) =>
      nodes.slice(0, maxItems).map((node) => {
        const nameEl     = node.querySelector('[data-testid="UserName"]');
        const bioEl      = node.querySelector('[data-testid="UserDescription"]');
        const linkEl     = node.querySelector('a[role="link"]');

        const nameLine   = nameEl?.textContent?.trim() ?? "";
        const atIndex    = nameLine.lastIndexOf("@");
        const name       = atIndex > 0 ? nameLine.slice(0, atIndex).trim() : nameLine;
        const handle     = atIndex > 0 ? nameLine.slice(atIndex) : "";
        const bio        = bioEl?.textContent?.trim() ?? "";
        const profileUrl = linkEl ? `https://twitter.com${linkEl.getAttribute("href")}` : "";

        return {
          name,
          handle,
          platform: "twitter" as const,
          profileUrl,
          headline: bio,
          company: null,
        };
      }),
    limit
  );

  return profiles.filter((p) => p.name.length > 0);
}

// Post a reply to a tweet. Requires auth cookies in the page's browser context.
export async function postReply(page: Page, tweetUrl: string, replyText: string): Promise<{ success: boolean; replyUrl: string | null }> {
  await navigate(page, tweetUrl);

  // Click the Reply button
  const replyBtn = page.locator('[data-testid="reply"]').first();
  await replyBtn.click();

  // Type the reply in the composer
  const composer = page.locator('[data-testid="tweetTextarea_0"]');
  await composer.waitFor({ timeout: 10_000 });
  await composer.fill(replyText);

  // Submit
  await page.locator('[data-testid="tweetButton"]').click();

  // Wait briefly for the reply to post
  await page.waitForTimeout(2_000);

  return { success: true, replyUrl: null }; // URL would need another lookup; success is enough for now
}
