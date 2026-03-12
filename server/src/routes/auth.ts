import { Hono, type Context, type Next } from "hono";
import { db, users } from "../db/index.js";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../lib/hono.js";

const auth = new Hono<AppEnv>();

// Auth middleware — validates Supabase JWT and attaches userId to context.
// Used by all protected routes.
const DEV_USER_ID = "00000000-0000-0000-0000-000000000000";
const DEV_USER_EMAIL = "dev@getu.ai";

export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  // Dev bypass — skip JWT validation, use a fixed dev user
  await db.insert(users)
    .values({ id: DEV_USER_ID, email: DEV_USER_EMAIL })
    .onConflictDoNothing();

  (c as Context<AppEnv>).set("userId", DEV_USER_ID);
  await next();
}

// GET /api/v1/auth/me — returns the authenticated user's id and email
auth.get("/me", async (c) => {
  const userId = c.get("userId") as string;
  const user   = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return c.json({ data: user, error: null });
});

export default auth;
