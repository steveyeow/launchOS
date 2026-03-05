// Shared types used by both frontend and backend

// ── Agent names ──────────────────────────────────────────────────────────────

export type AgentName = "ARIA" | "SCOUT" | "GEO" | "PULSE" | "FORGE" | "HERALD" | "LENS" | "COMMUNITY";

export type AgentStatus = "active" | "available" | "coming_soon";

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "paused";

export interface Task {
  id: string;
  userId: string;
  agentName: AgentName;
  title: string;
  goal: string;
  status: TaskStatus;
  priority: number;
  resultSummary: string | null;
  resultData: TaskResultData | null;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  step: number;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolOutput: Record<string, unknown>;
  status: "success" | "error";
  durationMs: number;
  createdAt: string;
}

// ── Task result shapes (stored in resultData) ────────────────────────────────

export interface SignalPost {
  url: string;
  platform: "twitter" | "reddit";
  author: string;
  authorHandle: string;
  content: string;
  postedAt: string;
  relevanceScore: number; // 0-1
  relevanceExplanation: string;
  suggestedReplyAngle: string;
}

export interface IcpProfile {
  name: string;
  handle: string;
  platform: "twitter" | "linkedin";
  profileUrl: string;
  headline: string;
  company: string | null;
  matchExplanation: string;
  suggestedOutreach: string | null;
}

export interface OutreachDraft {
  targetProfile: IcpProfile;
  platform: "twitter" | "linkedin";
  messageType: "dm" | "reply" | "connection_request";
  subject: string | null; // for linkedin connection requests
  body: string;
  approved: boolean;
  sentAt: string | null;
}

// GEO Status Report result shape
export type GeoCheckStatus = "pass" | "fail" | "warn";

export interface GeoCheck {
  id:        string;
  name:      string;
  category:  "access" | "discovery" | "metadata" | "content";
  status:    GeoCheckStatus;
  score:     number;
  maxScore:  number;
  detail:    string;
  fix?:      string;
}

export interface GeoReport {
  url:              string;
  checkedAt:        string;
  foundationalScore: number; // 0-60
  intelligenceScore: number; // 0-40
  overallScore:     number;  // 0-100
  grade:            string;
  checks:           GeoCheck[];
  topFixes:         string[];
  aiTestPrompts:    string[];
}

export type TaskResultData =
  | { type: "signal_posts"; posts: SignalPost[] }
  | { type: "icp_profiles"; profiles: IcpProfile[] }
  | { type: "outreach_drafts"; drafts: OutreachDraft[] }
  | { type: "geo_report"; report: GeoReport }
  | { type: "generic"; data: Record<string, unknown> };

// ── Product profile ──────────────────────────────────────────────────────────

export interface ProductProfile {
  id: string;
  userId: string;
  name: string;
  description: string;
  valueProp: string;
  icpSummary: string;
  icpTitles: string[];
  icpIndustries: string[];
  icpCompanySize: string;
  painPoints: string[];
  targetChannels: string[];
  updatedAt: string;
}

// ── Conversation / Chat ──────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "tool";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  createdAt: string;
}

export interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
}

export interface Conversation {
  id: string;
  userId: string;
  agentName: AgentName;
  createdAt: string;
  title: string | null;
}

// ── Credentials ──────────────────────────────────────────────────────────────

export type CredentialPlatform = "twitter" | "linkedin" | "reddit";

export interface CredentialInfo {
  platform: CredentialPlatform;
  connected: boolean;
  connectedAt: string | null;
  scope: string[];
}

// ── API response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  error: string | null;
}
