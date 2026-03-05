import { pgTable, uuid, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";

// ── Users ─────────────────────────────────────────────────────────────────────
// Mirrors Supabase auth.users — we only store the id here, auth is handled by Supabase

export const users = pgTable("users", {
  id:        uuid("id").primaryKey(), // matches auth.users.id
  email:     text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Product Profiles ──────────────────────────────────────────────────────────

export const productProfiles = pgTable("product_profiles", {
  id:              uuid("id").primaryKey().defaultRandom(),
  userId:          uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  name:            text("name").notNull().default(""),
  description:     text("description").notNull().default(""),
  valueProp:       text("value_prop").notNull().default(""),      // extracted by ARIA
  icpSummary:      text("icp_summary").notNull().default(""),     // extracted by ARIA
  icpTitles:       text("icp_titles").array().notNull().default([]),
  icpIndustries:   text("icp_industries").array().notNull().default([]),
  icpCompanySize:  text("icp_company_size").notNull().default(""),
  painPoints:      text("pain_points").array().notNull().default([]),
  targetChannels:  text("target_channels").array().notNull().default([]),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Conversations ─────────────────────────────────────────────────────────────

export const conversations = pgTable("conversations", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentName: text("agent_name").notNull().default("ARIA"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Messages ──────────────────────────────────────────────────────────────────

export const messages = pgTable("messages", {
  id:             uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role:           text("role").notNull(), // "user" | "assistant" | "tool"
  content:        text("content").notNull().default(""),
  toolCalls:      jsonb("tool_calls"),    // populated when role = "assistant" with tool use
  toolResults:    jsonb("tool_results"),  // populated when role = "tool"
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const tasks = pgTable("tasks", {
  id:            uuid("id").primaryKey().defaultRandom(),
  userId:        uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentName:     text("agent_name").notNull(),
  title:         text("title").notNull(),
  goal:          text("goal").notNull(),
  status:        text("status").notNull().default("pending"), // pending|running|completed|failed|paused
  priority:      integer("priority").notNull().default(3),
  resultSummary: text("result_summary"),
  resultData:    jsonb("result_data"),   // typed TaskResultData from shared/types.ts
  error:         text("error"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  startedAt:     timestamp("started_at"),
  completedAt:   timestamp("completed_at"),
});

// ── Task Executions ───────────────────────────────────────────────────────────
// Step-by-step log of every tool call made during a task run

export const executions = pgTable("executions", {
  id:         uuid("id").primaryKey().defaultRandom(),
  taskId:     uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  step:       integer("step").notNull(),
  toolName:   text("tool_name").notNull(),
  toolInput:  jsonb("tool_input").notNull(),
  toolOutput: jsonb("tool_output").notNull(),
  status:     text("status").notNull(), // "success" | "error"
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

// ── Credentials ───────────────────────────────────────────────────────────────
// Stores encrypted platform session data for write actions

export const credentials = pgTable("credentials", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform:       text("platform").notNull(), // "twitter" | "linkedin"
  // Encrypted browser session cookies (AES-256). Decrypted only at execution time.
  encryptedData:  text("encrypted_data").notNull(),
  connected:      boolean("connected").notNull().default(true),
  scope:          text("scope").array().notNull().default([]),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
});
