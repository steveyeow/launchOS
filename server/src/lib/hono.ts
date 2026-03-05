import { Hono } from "hono";

// Variables injected by requireAuth middleware and available in all protected routes
export type AppVariables = {
  userId: string;
};

// Typed Hono instance for protected routes
export type AppEnv = { Variables: AppVariables };

export function createRouter() {
  return new Hono<AppEnv>();
}
