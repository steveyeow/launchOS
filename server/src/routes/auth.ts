import { Hono, type Context, type Next } from "hono";
import { createClient } from "@supabase/supabase-js";
import { db, users } from "../db/index.js";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../lib/hono.js";

const auth = new Hono<AppEnv>();

// Auth middleware — validates Supabase JWT and attaches userId to context.
// Used by all protected routes.
export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ data: null, error: "unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ data: null, error: "invalid token" }, 401);
  }

  // Ensure user row exists in our users table (upsert on first login)
  await db.insert(users)
    .values({ id: user.id, email: user.email! })
    .onConflictDoNothing();

  (c as Context<AppEnv>).set("userId", user.id);
  await next();
}

// GET /api/v1/auth/me — returns the authenticated user's id and email
auth.get("/me", async (c) => {
  const userId = c.get("userId") as string;
  const user   = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return c.json({ data: user, error: null });
});

export default auth;
