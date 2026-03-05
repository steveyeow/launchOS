import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

// Abstraction over browser providers.
// In development (USE_LOCAL_BROWSER=true): spins up a local Chromium instance.
// In production: delegates to Steel.dev cloud browser sessions.

export interface BrowserSession {
  page: Page;
  close: () => Promise<void>;
}

let _localBrowser: Browser | null = null;

async function getLocalBrowser(): Promise<Browser> {
  if (!_localBrowser || !_localBrowser.isConnected()) {
    _localBrowser = await chromium.launch({ headless: true });
  }
  return _localBrowser;
}

// Creates an isolated browser session for a single agent task.
// Each task gets its own BrowserContext so cookies/state don't bleed between tasks.
export async function createSession(options?: {
  cookies?: Array<{ name: string; value: string; domain: string; path: string }>;
}): Promise<BrowserSession> {
  const useLocal = process.env.USE_LOCAL_BROWSER === "true";

  if (useLocal) {
    const browser = await getLocalBrowser();
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });

    if (options?.cookies) {
      await context.addCookies(options.cookies);
    }

    const page = await context.newPage();

    return {
      page,
      close: async () => {
        await context.close();
      },
    };
  }

  // Production: use Steel.dev
  // Steel creates a remote browser session and returns a WebSocket endpoint
  // that Playwright can connect to.
  const steelApiKey = process.env.STEEL_API_KEY;
  if (!steelApiKey) throw new Error("STEEL_API_KEY is not set");

  // Dynamically import Steel SDK to avoid import errors in dev mode
  const { default: Steel } = await import("steel-sdk");
  const steel = new Steel({ steelAPIKey: steelApiKey });

  const steelSession = await steel.sessions.create({
    solveCaptcha: true,
  });

  const browser = await chromium.connectOverCDP(`wss://connect.steel.dev?apiKey=${steelApiKey}&sessionId=${steelSession.id}`);
  const context = browser.contexts()[0];

  if (options?.cookies) {
    await context.addCookies(options.cookies);
  }

  const page = await context.newPage();

  return {
    page,
    close: async () => {
      await browser.close();
      await steel.sessions.release(steelSession.id);
    },
  };
}

// Convenience: navigate and wait for the page to be reasonably settled
export async function navigate(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
}

// Convenience: extract all text from a selector, returns empty array if not found
export async function extractTexts(page: Page, selector: string): Promise<string[]> {
  return page.$$eval(selector, (els) => els.map((el) => (el as HTMLElement).innerText.trim()));
}
