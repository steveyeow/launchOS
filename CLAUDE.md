# CLAUDE.md — GetU.ai Development Guide

This file is automatically loaded by Claude Code at the start of every session.
All code comments and documentation must be written in **English**.

---

## Product Overview

**GetU.ai** is a hosted, multi-agent GTM (Go-To-Market) execution platform.
Users describe their product to ARIA (the main orchestrator AI), align on a GTM strategy,
and ARIA deploys specialist agents that autonomously execute tasks across real platforms
(Twitter/X, LinkedIn, Reddit, Discord, etc.).

Core analogy: replacing the need to hire, onboard, and manage a marketing team.

---

## Tech Stack

### Frontend
- **React 19 + TypeScript** — component framework
- **Vite** — build tool and dev server
- **Vercel AI SDK** (`ai` package) — streaming chat UI, tool call rendering
- No UI component library — custom styles with inline style objects (existing pattern)

### Backend (`/server`)
- **Node.js + TypeScript**
- **Hono** — lightweight HTTP framework (TypeScript-first, fast, edge-compatible)
- **Vercel AI SDK** — LLM calls, streaming, tool use
- **DeepSeek API** — primary LLM (`deepseek-chat` for all agents)
- **BullMQ + Redis** — agent task queue and job processing
- **Drizzle ORM** — TypeScript-first ORM

### Browser Automation
- **Steel.dev** — cloud browser service for production (sandboxed, scalable, designed for AI agents)
- **Playwright** — browser control library (works with Steel.dev in prod, local Chromium in dev)
- All platform interactions (Twitter, LinkedIn, Reddit, Discord) go through this layer
- No official platform APIs needed — agents operate web UIs like a human would
- Design: thin abstraction in `server/src/browser/` so the underlying service can be swapped

### Database & Auth
- **Supabase** — PostgreSQL database + Auth + Realtime subscriptions
- Supabase Auth for user authentication (email + OAuth)
- Supabase Realtime for live agent status updates pushed to frontend

### Deployment
- **Vercel** — frontend hosting
- **Railway** — backend (Hono server) + Redis hosting
- **Supabase Cloud** — database + auth

---

## Project Structure

```
/
├── src/                    # Frontend React source
│   ├── components/         # Reusable UI components
│   │   ├── chat/           # ARIA chat interface components
│   │   ├── dashboard/      # Dashboard, agent cards, stats
│   │   ├── tasks/          # Mission/task center components
│   │   └── agents/         # Agent marketplace components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Frontend utilities, API client
│   ├── types/              # Frontend-specific types (import from shared/ when possible)
│   └── main.tsx
│
├── server/                 # Backend source
│   ├── src/
│   │   ├── agents/         # Agent implementations
│   │   │   ├── aria.ts     # Main orchestrator agent
│   │   │   ├── scout.ts    # LinkedIn/Twitter prospecting
│   │   │   ├── pulse.ts    # Twitter content & engagement
│   │   │   └── base.ts     # Base agent class
│   │   ├── routes/         # Hono route handlers
│   │   │   ├── chat.ts     # ARIA chat (streaming)
│   │   │   ├── tasks.ts    # Task CRUD
│   │   │   ├── agents.ts   # Agent management
│   │   │   └── auth.ts     # Auth middleware
│   │   ├── services/       # Business logic
│   │   │   ├── aria.ts     # ARIA orchestration logic
│   │   │   ├── queue.ts    # BullMQ job queue setup
│   │   │   └── credentials.ts  # User credential management
│   │   ├── db/
│   │   │   ├── schema.ts   # Drizzle schema definitions
│   │   │   └── index.ts    # DB client
│   │   ├── tools/          # Agent tool implementations
│   │   │   ├── twitter.ts  # Twitter/X API wrapper
│   │   │   ├── linkedin.ts # LinkedIn API wrapper
│   │   │   └── web.ts      # Web search/scraping
│   │   └── index.ts        # Hono app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                 # Shared TypeScript types (used by both frontend and backend)
│   └── types.ts
│
├── docs/
│   └── SPEC.md             # Product specification (source of truth)
│
├── index.tsx               # Legacy prototype (reference only, do not modify)
├── CLAUDE.md               # This file
├── README.md
└── package.json            # Frontend package.json
```

---

## Architecture Decisions

### 1. Unified TypeScript Stack
Frontend and backend both use TypeScript. Shared types live in `/shared/types.ts` and are
imported by both. This eliminates a whole class of type mismatch bugs.

### 2. ARIA as Orchestrator
ARIA is not a simple chatbot — it is the central orchestrator. It:
- Maintains persistent memory of the user's product and ICP
- Decides which specialist agents to deploy and when
- Receives reports from agents and surfaces insights to the user
- Never executes platform actions directly — it delegates to specialist agents

### 3. Agentic Loop Pattern
Each specialist agent follows the same loop:
```
receive task → plan steps → call tools → observe result → continue or report done
```
This is implemented via Claude's tool use API. Each agent has a defined tool set.

### 4. Task Queue for Reliability
All agent tasks go through BullMQ. This gives us:
- Retry on failure
- Concurrency control per user
- Progress tracking
- Audit log of all executions

### 5. Real-time via Supabase
Agent status updates are written to the `tasks` table and pushed to the frontend via
Supabase Realtime subscriptions. No polling needed.

### 6. Credentials are Encrypted
User OAuth tokens and API keys are stored encrypted in the database.
Never log credentials. Never expose them in API responses.

---

## Development Conventions

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`

### API Design
- All API routes prefixed with `/api/v1/`
- Auth required on all routes except `/api/v1/auth/*`
- Return `{ data, error }` shape consistently
- Stream chat responses using SSE (Hono supports this natively)

### Agent Tool Definitions
Each agent tool must define:
```typescript
{
  name: string           // snake_case verb_noun: "search_twitter", "post_tweet"
  description: string    // What this tool does, written for the LLM
  parameters: ZodSchema  // Input validation
  execute: async (params) => ToolResult  // Implementation
}
```

### Error Handling
- Never throw unhandled errors in agent loops — catch and report to task
- All tool calls wrapped in try/catch with structured error returns
- User-facing errors must be human-readable (no stack traces)

### Comments
- Write comments for non-obvious logic only
- Do not comment obvious code
- All comments in English

---

## Key Models (quick reference, full schema in SPEC.md)

```
User → Product (1:1, user's product description + ICP)
User → Conversations (1:many, chat sessions with ARIA)
User → Tasks (1:many, all agent tasks)
Task → Executions (1:many, each run of the task)
User → Credentials (1:many, connected platform accounts)
```

---

## Environment Variables

```
# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Backend (server/.env)
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
REDIS_URL=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
ENCRYPTION_KEY=          # For encrypting user credentials (AES-256)
STEEL_API_KEY=           # Steel.dev cloud browser (production)
USE_LOCAL_BROWSER=true   # Set to false in production to use Steel.dev
```

---

## MVP Scope

See `docs/SPEC.md` for full spec. MVP = Phase 1:
1. User auth + product onboarding (ARIA extracts product profile)
2. ARIA chat with streaming — strategy generation and task creation
3. Browser execution layer (Steel.dev + Playwright)
4. SCOUT — read-only actions across Twitter, LinkedIn, Reddit:
   - Find signal posts (people expressing the pain your product solves)
   - Find ICP-matching people
   - Generate personalized outreach drafts (human reviews before sending)
5. Mission Center — live task status via Supabase Realtime
6. First real execution: user connects Twitter → SCOUT posts a reply (user confirms first)

Key principle: read-only actions ship first, write actions require explicit user confirmation.
Phase 2+: PULSE (content), COMMUNITY (Discord/Telegram), FORGE (SEO), auto-send with guardrails.
