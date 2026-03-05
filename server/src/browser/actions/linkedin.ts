import type { Page } from "playwright";
import { navigate } from "../index.js";
import type { IcpProfile } from "../../../../shared/types.js";

// LinkedIn browser actions used by SCOUT agent.
// Read actions use LinkedIn's public search (no login required for basic results).
// Note: LinkedIn aggressively rate-limits and blocks scrapers — keep requests slow
// and use realistic user agents. Steel.dev's residential proxies help in production.

// Search LinkedIn for people matching an ICP query.
// Uses the public people search which works without login for basic results.
export async function searchLinkedInProfiles(
  page: Page,
  query: string,
  limit = 15
): Promise<Omit<IcpProfile, "matchExplanation" | "suggestedOutreach">[]> {
  const encoded = encodeURIComponent(query);
  await navigate(page, `https://www.linkedin.com/search/results/people/?keywords=${encoded}`);

  // LinkedIn may show a login wall — check for it
  const loginWall = await page.$(".login-container, #session_key").catch(() => null);
  if (loginWall) {
    // Return empty — caller should surface "connect LinkedIn account" prompt
    return [];
  }

  await page.waitForSelector(".reusable-search__result-container, .search-results-container", {
    timeout: 12_000,
  }).catch(() => null);

  const profiles = await page.$$eval(
    ".reusable-search__result-container li, .search-results__list li",
    (nodes, maxItems) =>
      nodes.slice(0, maxItems).map((node) => {
        const nameEl     = node.querySelector(".actor-name, .entity-result__title-text a");
        const headlineEl = node.querySelector(".subline-level-1, .entity-result__primary-subtitle");
        const linkEl     = node.querySelector("a.app-aware-link, a[href*='/in/']");

        const name       = nameEl?.textContent?.trim() ?? "";
        const headline   = headlineEl?.textContent?.trim() ?? "";
        const profileUrl = linkEl?.getAttribute("href")?.split("?")[0] ?? "";

        // Try to extract company from headline (often "Title at Company")
        const companyMatch = headline.match(/ at (.+)$/i);
        const company      = companyMatch ? companyMatch[1].trim() : null;

        return {
          name,
          handle:     profileUrl.split("/in/")[1]?.replace("/", "") ?? "",
          platform:   "linkedin" as const,
          profileUrl: profileUrl.startsWith("http") ? profileUrl : `https://www.linkedin.com${profileUrl}`,
          headline,
          company,
        };
      }),
    limit
  );

  return profiles.filter((p) => p.name.length > 0);
}
